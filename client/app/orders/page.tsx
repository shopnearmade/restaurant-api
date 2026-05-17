'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { auth } from '@/lib/auth';
import { orderApi, menuApi, customerApi, Order, MenuItem, Customer } from '@/lib/api';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'] as const;

interface OrderLine { item: string; quantity: number }

const EMPTY_CREATE_FORM = {
  customer: '',
  specialInstructions: '',
  status: 'Pending' as Order['status'],
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');

  // Data needed for the create form
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Create order modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([{ item: '', quantity: 1 }]);
  const [createError, setCreateError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit (status only) modal
  const [editModal, setEditModal] = useState<{ open: boolean; order?: Order }>({ open: false });
  const [editStatus, setEditStatus] = useState<Order['status']>('Pending');
  const [editInstructions, setEditInstructions] = useState('');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) { router.replace('/login'); return; }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders(params?: Record<string, string>) {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getAll(params);
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function applyFilter() {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    fetchOrders(params);
  }

  function resetFilter() {
    setFilterStatus('');
    fetchOrders();
  }

  // Load customers + menu items when opening the create modal
  async function openCreateModal() {
    setCreateForm(EMPTY_CREATE_FORM);
    setOrderLines([{ item: '', quantity: 1 }]);
    setCreateError('');
    setCreateModal(true);
    try {
      const [c, m] = await Promise.all([
        customerApi.getAll({ limit: '100' }),
        menuApi.getAll({ limit: '100' }),
      ]);
      setCustomers(c.customers);
      setMenuItems(m.menuItems);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to load form data');
    }
  }

  function openEditModal(order: Order) {
    setEditStatus(order.status);
    setEditInstructions(order.specialInstructions ?? '');
    setEditModal({ open: true, order });
  }

  // Calculate total from selected lines using current menu item prices
  function calcTotal(): number {
    return orderLines.reduce((sum, line) => {
      const item = menuItems.find(m => m._id === line.item);
      return sum + (item ? item.price * line.quantity : 0);
    }, 0);
  }

  function updateLine(index: number, field: 'item' | 'quantity', value: string | number) {
    setOrderLines(prev =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  }

  function addLine() {
    setOrderLines(prev => [...prev, { item: '', quantity: 1 }]);
  }

  function removeLine(index: number) {
    setOrderLines(prev => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');

    const validLines = orderLines.filter(l => l.item);
    if (!createForm.customer) { setCreateError('Please select a customer'); return; }
    if (validLines.length === 0) { setCreateError('Please add at least one menu item'); return; }

    setSaving(true);
    try {
      await orderApi.create({
        customer: createForm.customer,
        menuItem: validLines,
        totalAmount: calcTotal(),
        status: createForm.status,
        ...(createForm.specialInstructions ? { specialInstructions: createForm.specialInstructions } : {}),
      });
      setCreateModal(false);
      showSuccess('Order created');
      fetchOrders();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.order) return;
    setSaving(true);
    try {
      await orderApi.update(editModal.order._id, {
        status: editStatus,
        ...(editInstructions ? { specialInstructions: editInstructions } : {}),
      });
      setEditModal({ open: false });
      showSuccess('Order updated');
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await orderApi.delete(deleteId);
      setDeleteId(null);
      showSuccess('Order deleted');
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleteId(null);
    }
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  // Helper to extract display name from populated or raw value
  function customerName(order: Order): string {
    if (typeof order.customer === 'object' && order.customer !== null) {
      return (order.customer as Customer).name;
    }
    return String(order.customer);
  }

  function orderItemsSummary(order: Order): string {
    return order.menuItem
      .map(line => {
        const name = typeof line.item === 'object' ? (line.item as MenuItem).name : 'Item';
        return `${name} ×${line.quantity}`;
      })
      .join(', ');
  }

  const statusColors: Record<Order['status'], string> = {
    Pending:    'bg-yellow-100 text-yellow-700',
    Preparing:  'bg-blue-100 text-blue-700',
    Ready:      'bg-purple-100 text-purple-700',
    Completed:  'bg-green-100 text-green-700',
    Cancelled:  'bg-red-100 text-red-700',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{total} order{total !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Order
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          <button
            onClick={resetFilter}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No orders found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{customerName(order)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{orderItemsSummary(order)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(order._id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create Order Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Order</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  value={createForm.customer}
                  onChange={e => setCreateForm(prev => ({ ...prev, customer: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select a customer…</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Order lines: item + quantity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {orderLines.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={line.item}
                        onChange={e => updateLine(i, 'item', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select item…</option>
                        {menuItems.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name} (${m.price.toFixed(2)})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {orderLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="text-red-400 hover:text-red-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Auto-calculated total */}
                {calcTotal() > 0 && (
                  <p className="text-sm text-gray-600 mt-2 text-right">
                    Total: <span className="font-semibold text-gray-900">${calcTotal().toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={createForm.specialInstructions}
                  onChange={e => setCreateForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={2}
                  placeholder="e.g. No onions please"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Placing order…' : 'Place Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal (status + instructions) */}
      {editModal.open && editModal.order && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Update Order</h2>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as Order['status'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={editInstructions}
                  onChange={e => setEditInstructions(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false })}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete order?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
