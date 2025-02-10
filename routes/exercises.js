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
        console.log('Fetching exercises for category:', req.params.category);
        // Log the query we're about to make
        console.log('Query:', { category: req.params.category });
        
        // First check if the category exists in any document
        const categories = await Exercise.distinct('category');
        console.log('Available categories:', categories);
        
        const exercises = await Exercise.find({ category: req.params.category });
        console.log('Found exercises:', exercises.length);
        
        // If no exercises found, log more details
        if (exercises.length === 0) {
            console.log('No exercises found. Checking database state:');
            const allExercises = await Exercise.find();
            console.log('Total exercises in DB:', allExercises.length);
            console.log('Sample of all exercises:', allExercises.slice(0, 2));
        }
        
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
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