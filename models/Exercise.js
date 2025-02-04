const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['Push', 'Pull', 'Legs', 'Core', 'Cardio'],
        required: true
    },
    equipment: {
        type: String,
        enum: ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable', 'Other'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    recommendedReps: {
        min: Number,
        max: Number
    },
    // Weight ranges as percentage of body weight
    weightRanges: {
        beginner: {
            min: Number,
            max: Number
        },
        intermediate: {
            min: Number,
            max: Number
        },
        advanced: {
            min: Number,
            max: Number
        }
    },
    description: String,
    form: String,
    muscles: [String]
});

module.exports = mongoose.model('Exercise', exerciseSchema); 