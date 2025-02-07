const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = auth; 