const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth');

const authService = new AuthService();

// Handle preflight requests
router.options('/login', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

// Login route
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);  // Add logging
        const { username, email, password } = req.body;
        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const result = await authService.login(identifier, password);
        res.json(result);
    } catch (error) {
        console.error('Login route error:', error);
        res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
});

// ... other auth routes ...

module.exports = router; 