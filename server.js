require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const achievementRoutes = require('./routes/achievements');
const exerciseRoutes = require('./routes/exercises');
const userRoutes = require('./routes/users');
const { seedExercises } = require('./seeds/exercises');
const Exercise = require('./models/Exercise');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'https://pageywhudson.github.io'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.static('./'));

// Handle CORS preflight requests
app.options('*', cors());

// Debug middleware for user routes
app.use('/api/users/*', (req, res, next) => {
    console.log('User route accessed:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection;
    console.log('Database name:', db.name);
    console.log('Collections:', await db.db.listCollections().toArray());
    
    console.log('Seeding exercises...');
    const seeded = await seedExercises();
    if (seeded) {
        console.log('Successfully seeded exercises');
        const count = await Exercise.countDocuments();
        console.log('Number of exercises in database:', count);
        const sample = await Exercise.findOne();
        console.log('Sample exercise:', sample);
    } else {
        console.error('Failed to seed exercises');
    }
})
.catch(err => {
    console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    process.exit(1);
});

// Add error handler
mongoose.connection.on('error', err => {
    console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 