const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth');
const auth = new AuthService();

router.post('/register', async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const result = await auth.register(req.body);
        res.json(result);
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await auth.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router; 