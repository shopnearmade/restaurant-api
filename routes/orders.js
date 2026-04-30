import express from 'express';
import Order from '../models/order.js';


const router = express.Router();
 
router.use(express.json());

// Create an order
router.post('/',async (req,res) =>
{
    try{
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    }
    catch(err)
    {
        res.status(400).json({error:err.message});
    }
});

// Get all orders
router.get('/',async (req,res) =>
{
    try{
        const orders = await Order.find();
        res.status(200).json(orders);
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

// filter order by the most sold item
router.get('/popular',async (req,res) =>
{
    try{
        const orders = await Order.find().populate("menuItem.item");
        const count = {};
        // count the max count of each item
        let MaxCount = 0;
        // store the most popular item
        let popularItem ="";

        //loop through the orders and count the number of times each item is ordered
        // and find the most popular item
        orders.forEach(order => {
            order.menuItem.forEach(menuItem => {
                const itemId = menuItem.item._id.toString();
              
                if(count[itemId]) {
                     count[itemId]++;
                } else {
                     count[itemId] = 1;
                }

                if(MaxCount < count[itemId]) {
                    MaxCount = count[itemId];
                    popularItem = menuItem.item.name;
                }
                 
            });
        });


        res.status(200).json({"item":popularItem,"count":MaxCount});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

// Get an order by Id
router.get('/:id',async (req,res) =>
{
    try{
        const order = await Order.findById(req.params.id);
        if(!order)
        {
           return res.status(400).json({"error":"Order not found"});
        }
         
        res.status(200).json(order);
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

// Update an order
router.put('/:id',async (req,res) =>
{
    try{
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {new:true,  runValidators: true});
        if(!order)
        {
           return res.status(400).json({"error":"Order not found"});
        }
         
        res.status(200).json(order);
    }
    catch(err)
    {
         res.status(500).json({error:err.message});
    }
});

// Delete an order
router.delete('/:id',async (req,res) =>
{
    try{
        const order = await Order.findByIdAndDelete(req.params.id);
        if(!order)
        {
          return  res.status(400).json({"error":"Order not found"});
        }

        res.status(200).json(order);
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

  

export default router;

