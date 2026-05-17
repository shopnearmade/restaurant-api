import express from 'express';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes require a valid JWT
router.use(protect);

// Create a new user
router.post("/",async(req,res)=>{
    try{
        const admin = new User (req.body);
        await admin.save();
        res.status(201).json(admin)
    }
    catch(error) {
        res.status(400).json({ message: "Failed to create admin", error: error.message });
    }
})

// Get a user by ID
router.get("/:id", async (req,res)=> {
    try{
        const admin = await User.findById(req.params.id);
        if (!admin){
            return res.status(404).json({message: "Admin is not found!"})
        }
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({error:error.message});
    }
})

// Update a user
router.put("/:id", async (req,res)=> {
    try {
        const admin = await User.findById(req.params.id);
        if(!admin){
             return res.status(404).json({message: "Admin is not found!"})
        }
        
        // Update the user and save
        Object.assign(admin, req.body);
        await admin.save();
        
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
})

// Delete a user
router.delete("/:id", async (req,res)=> {
    try {
        const admin = await User.findByIdAndDelete(req.params.id);
        if(!admin){
            return res.status(404).json({message: "Admin is not found!"})
        }
        res.status(200).json({ message: "Admin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
})


export default router;
