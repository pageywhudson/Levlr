const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const AuthService = require('../services/auth');
const auth = new AuthService();
const ExperienceCalculator = require('../utils/experienceCalculator');

// Log new workout
router.post('/', auth.verifyToken, async (req, res) => {
    try {
        console.log('Received workout data:', req.body);
        console.log('User ID:', req.userId);

        // Calculate XP before saving
        const calculator = new ExperienceCalculator();
        let totalXP = 0;
        req.body.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                const setXP = calculator.calculateSetXP({
                    exercise: exercise.name,
                    weight: set.weight.value,
                    reps: set.reps,
                    difficulty: 'Intermediate' // You might want to store this in exercise data
                });
                set.xp = setXP;
                totalXP += setXP;
            });
        });
        req.body.xpEarned = totalXP;

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

        // Make sure stats object exists
        if (!user.stats) {
            user.stats = { xp: 0 };
        }
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