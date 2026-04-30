import express from "express";
import MenuItem from "../models/menuItem.js";

const router = express.Router();

// Get all menu items — supports filtering, search, sorting, and pagination
// Query params: category, available, name (regex search), sort, page, limit
router.get("/", async (req, res) => {
  try {
    const { category, available, name, sort, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === "true";
    if (name) filter.name = { $regex: name, $options: "i" };

    const menuItems = await MenuItem.find(filter)
      .sort(sort ? { [sort]: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MenuItem.countDocuments(filter);

    res.json({ total, page: parseInt(page), limit: parseInt(limit), menuItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get only currently available items
router.get("/available", async (req, res) => {
  try {
    const { sort, page = 1, limit = 10 } = req.query;

    const menuItems = await MenuItem.find({ available: true })
      .sort(sort ? { [sort]: 1 } : { name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new menu item
router.post("/", async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Full update of a menu item
router.put("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Partial update of a menu item
router.patch("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a menu item
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
