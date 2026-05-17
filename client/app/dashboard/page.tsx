'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { auth, AuthUser } from '@/lib/auth';
import { orderApi, menuApi, customerApi } from '@/lib/api';

interface Stats {
  totalOrders: number;
  totalMenuItems: number;
  totalCustomers: number;
  popularItem: string;
  popularItemCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    setUser(currentUser);
    loadStats();
  }, [router]);

  async function loadStats() {
    try {
      // Fetch counts and popular item in parallel
      const [ordersRes, menuRes, customersRes, popularRes] = await Promise.all([
        orderApi.getAll({ limit: '1' }),
        menuApi.getAll({ limit: '1' }),
        customerApi.getAll({ limit: '1' }),
        orderApi.getPopular(),
      ]);
      setStats({
        totalOrders: ordersRes.total,
        totalMenuItems: menuRes.total,
        totalCustomers: customersRes.total,
        popularItem: popularRes.item || '—',
        popularItemCount: popularRes.count || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    }
  }

  const quickLinks = [
    { href: '/menu', label: 'Menu Items', desc: 'Add, edit, and manage menu items', color: 'bg-blue-50 border-blue-200' },
    { href: '/customers', label: 'Customers', desc: 'View and manage customer records', color: 'bg-green-50 border-green-200' },
    { href: '/orders', label: 'Orders', desc: 'Track and update order statuses', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Role: <span className="font-medium text-gray-700">{user?.role}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders },
              { label: 'Menu Items', value: stats.totalMenuItems },
              { label: 'Customers', value: stats.totalCustomers },
              { label: 'Most Popular', value: stats.popularItem, sub: `${stats.popularItemCount} orders` },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
                {stat.sub && <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Quick Navigation */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`border rounded-xl p-6 hover:shadow-md transition-shadow ${link.color}`}
            >
              <h3 className="font-semibold text-gray-800 mb-1">{link.label}</h3>
              <p className="text-sm text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
