const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// Get all exercises
router.get('/', auth, async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exercises' });
    }
});

// Get exercises by category
router.get('/category/:category', auth, async (req, res) => {
    try {
        const exercises = await Exercise.find({ category: req.params.category });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exercises' });
    }
});

// Get single exercise by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exercise = await Exercise.findOne({ id: req.params.id });
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        res.json(exercise);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exercise' });
    }
});

module.exports = router; 