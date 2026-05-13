import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/order.js';

const router = express.Router();

// Require a valid JWT token for all order routes
router.use(protect);

// Get all orders — supports filtering by status/customer, sorting, pagination, and populates related docs
router.get('/', async (req, res) => {
  try {
    const { status, customer, sort, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('menuItem.item', 'name price')
      .sort(sort ? { [sort]: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({ total, page: parseInt(page), limit: parseInt(limit), orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// filter order by the most sold item
router.get('/popular', async (req, res) => {
  try {
    const orders = await Order.find().populate('menuItem.item');
    const count = {};
    let maxCount = 0;
    let popularItem = '';

    // count how many times each menu item appears across all orders
    orders.forEach(order => {
      order.menuItem.forEach(menuItem => {
        if (!menuItem.item) return;
        const itemId = menuItem.item._id.toString();
        count[itemId] = (count[itemId] || 0) + 1;

        if (count[itemId] > maxCount) {
          maxCount = count[itemId];
          popularItem = menuItem.item.name;
        }
      });
    });

    res.status(200).json({ item: popularItem, count: maxCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get an order by ID — populates customer and menu item details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('menuItem.item', 'name price category');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create an order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Full update of an order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partial update of an order (e.g. just change the status)
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
