const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const AuthService = require('../services/auth');
const auth = new AuthService();

// Log new workout
router.post('/', auth.verifyToken, async (req, res) => {
    try {
        console.log('Received workout data:', req.body);
        console.log('User ID:', req.userId);

        const workout = new Workout({
            userId: req.userId,
            ...req.body
        });
        
        console.log('Created workout document:', workout);

        await workout.save();  // Saves to MongoDB

        // Update user XP in database
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        console.log('Found user:', user);

        user.stats.xp += workout.xpEarned;
        await user.save();

        console.log('Workout saved successfully');
        res.json(workout);
    } catch (error) {
        console.error('Error saving workout:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get user's workouts
router.get('/', auth.verifyToken, async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.userId })
            .sort({ date: -1 });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 