const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');

// Get user's achievements
router.get('/', auth, async (req, res) => {
    try {
        const achievements = await Achievement.find({ userId: req.user.id });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add achievement
router.post('/', auth, async (req, res) => {
    try {
        const achievement = new Achievement({
            userId: req.user.id,
            achievementId: req.body.achievementId
        });
        await achievement.save();
        res.json(achievement);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Achievement already earned' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 