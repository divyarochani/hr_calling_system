const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['missed_call', 'call_completed', 'screening_done', 'interview_scheduled', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        callId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Call',
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
        },
        read: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);
