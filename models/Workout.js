const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    exercises: [{
        name: {
            type: String,
            required: true
        },
        sets: [{
            weight: {
                value: Number,
                unit: String // 'kg' or 'lbs'
            },
            reps: Number,
            completed: {
                type: Boolean,
                default: true
            }
        }],
        notes: String
    }],
    duration: Number, // in minutes
    totalVolume: Number, // total weight lifted
    xpEarned: Number,
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema); 