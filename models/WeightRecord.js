const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'lbs'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WeightRecord', weightRecordSchema); 