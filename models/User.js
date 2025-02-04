const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    measurements: {
        height: {
            value: Number,
            unit: String
        },
        weight: {
            value: Number,
            unit: String
        }
    },
    stats: {
        level: {
            type: Number,
            default: 1
        },
        xp: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 