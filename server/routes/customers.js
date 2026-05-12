import express from "express";
import Customer from "../models/customer.js";
 
const router = express.Router();
 

router.get("/", async (req, res) => {
  try {
    const { name, sort, page = 1, limit = 10 } = req.query;
 
    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
 
    const customers = await Customer.find(filter)
      .sort(sort ? { [sort]: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
 
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// create a new customer
router.post("/", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 
// full update
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 

router.patch("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 
// delete a customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
export default router;