const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Get user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return weight in the format expected by the frontend
        const response = {
            ...user.toObject(),
            weight: user.measurements?.weight?.value || 0
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Error fetching user info' });
    }
});

// Update user info
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const updates = { ...req.body };
        
        // If weight is being updated, put it in measurements
        if (updates.weight !== undefined) {
            updates['measurements.weight.value'] = updates.weight;
            updates['measurements.weight.unit'] = req.body.unit || 'kg';
            delete updates.weight;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return response in format expected by frontend
        const response = {
            ...user.toObject(),
            weight: user.measurements?.weight?.value || 0
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ message: 'Error updating user info' });
    }
});

module.exports = router; 