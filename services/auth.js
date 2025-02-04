const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
    // Register new user
    async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });
            
            if (existingUser) {
                throw new Error('Email or username already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create new user
            const user = new User({
                username: userData.username,
                fullName: userData.fullName,
                email: userData.email,
                password: hashedPassword,
                measurements: {
                    height: {
                        value: userData.height.value,
                        unit: userData.height.unit
                    },
                    weight: {
                        value: userData.weight.value,
                        unit: userData.weight.unit
                    }
                },
                stats: {
                    level: 1,
                    xp: 0,
                    streak: 0
                }
            });

            await user.save();

            // Generate JWT token
            const token = this.generateToken(user._id, {
                fullName: user.fullName,
                username: user.username
            });

            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    stats: user.stats
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Login user
    async login(identifier, password) {
        try {
            // Find user by email or username
            const user = await User.findOne({
                $or: [
                    { email: identifier },
                    { username: identifier }
                ]
            });

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = this.generateToken(user._id, {
                fullName: user.fullName,
                username: user.username
            });

            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    stats: user.stats
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Generate JWT Token
    generateToken(userId, userData) {
        return jwt.sign(
            { 
                userId,
                fullName: userData.fullName,
                username: userData.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
    }

    // Verify Token Middleware
    verifyToken(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    }
}

module.exports = AuthService; 