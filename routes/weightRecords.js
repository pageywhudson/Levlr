const express = require('express');
const router = express.Router();
const WeightRecord = require('../models/WeightRecord');
const auth = require('../middleware/auth');

// Add new weight record
router.post('/', auth, async (req, res) => {
    try {
        const { weight, unit } = req.body;
        
        const weightRecord = new WeightRecord({
            userId: req.user.id,
            weight,
            unit
        });

        await weightRecord.save();
        res.status(201).json(weightRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error saving weight record' });
    }
});

// Get weight history
router.get('/', auth, async (req, res) => {
    try {
        const weightRecords = await WeightRecord.find({ 
            userId: req.user.id 
        }).sort({ date: -1 });
        
        res.json(weightRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weight records' });
    }
});

module.exports = router; 