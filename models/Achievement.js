const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievementId: {
        type: String,
        required: true
    },
    earnedDate: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can only earn each achievement once
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema); 