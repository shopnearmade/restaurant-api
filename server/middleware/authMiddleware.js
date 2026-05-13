import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token was sent in the headers (Format: "Bearer <token>")
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (remove "Bearer " from the string)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using a secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key');

            // 3. Find the user in the database using the ID saved inside the token
            req.user = await User.findById(decoded.id).select('-password');

            // 4. Move on to the actual route
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};