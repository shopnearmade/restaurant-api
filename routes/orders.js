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
        const order = await Order.find();
        res.status(200).json(order);
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
        const orders = await Order.find().populate("menuItem");
        const count = {};

        // for(const order of orders)
        // {
        //     for(const item of order)
        //     {
        //     }
              
        // }
        res.status(201).json(orders);
    }
    catch(err)
    {
        res.status(400).json({error:err.message});
    }
});

// Get an order by Id
router.get('/:id',async (req,res) =>
{
    try{
        const order = await Order.findById(req.params.id);
        if(!order)
        {
            res.status(400).json({"error":"Order not found"});
        }
         
        res.status(201).json(order);
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

// Update an order
// router.get('/:id',async (req,res) =>
// {
//     try{
//         const order = await Order.findById(req.params.id);
//         if(!order)
//         {
//             res.status(400).json({"error":"Order not found"});
//         }
         
//         res.status(201).json(order);
//     }
//     catch(err)
//     {
//         res.status(500).json({error:err.message});
//     }
// });

  

export default router;

