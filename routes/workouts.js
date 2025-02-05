const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const AuthService = require('../services/auth');
const auth = new AuthService();

// Log new workout
router.post('/', auth.verifyToken, async (req, res) => {
    try {
        const workout = new Workout({
            userId: req.userId,
            ...req.body
        });
        
        await workout.save();  // Saves to MongoDB

        // Update user XP in database
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        user.stats.xp += workout.xpEarned;
        await user.save();

        res.json(workout);
    } catch (error) {
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