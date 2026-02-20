const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
    {
        callSid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
        },
        callType: {
            type: String,
            enum: ['inbound', 'outbound'],
            default: 'outbound',
        },
        status: {
            type: String,
            enum: ['initiated', 'ringing', 'connected', 'ongoing', 'completed', 'missed', 'failed'],
            default: 'initiated',
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number, // in seconds
            default: 0,
        },
        transferRequested: {
            type: Boolean,
            default: false,
        },
        transferNumber: {
            type: String,
        },
        recordingUrl: {
            type: String,
        },
        transcriptUrl: {
            type: String,
        },
        summary: {
            type: String,
        },
        recordingPath: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure callSid is unique - prevent duplicates
callSchema.index({ callSid: 1 }, { unique: true });

module.exports = mongoose.model('Call', callSchema);
