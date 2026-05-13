import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password are provided in the request
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide an email and password' });
        }

        // 2. Check if user exists ( use +password) 
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Check if password matches using the method from models/user.js
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Create the JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'my_super_secret_key', {
            expiresIn: '30d' // Token expires in 30 days
        });

        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
