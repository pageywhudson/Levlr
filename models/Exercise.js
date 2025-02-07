const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    category: {
        type: String,
        enum: ['weightlifting', 'bodyweight', 'cardio'],
        required: true
    },
    type: {
        type: String,
        enum: ['popular', 'other'],
        default: 'other'
    },
    muscles: [{
        type: String
    }],
    recommendedReps: {
        min: Number,
        max: Number,
        unit: {
            type: String,
            default: 'reps'
        }
    },
    tips: [{
        type: String
    }],
    achievements: [{
        id: String,
        requirement: Number
    }]
});

module.exports = mongoose.model('Exercise', exerciseSchema); 