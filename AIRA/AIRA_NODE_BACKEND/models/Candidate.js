const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },
        candidateName: {
            type: String,
            default: null,
        },
        currentCompany: {
            type: String,
            default: null,
        },
        currentRole: {
            type: String,
            default: null,
        },
        desiredRole: {
            type: String,
            default: null,
        },
        domain: {
            type: String,
            default: null,
        },
        noticePeriod: {
            type: String,
            default: null,
        },
        currentLocation: {
            type: String,
            default: null,
        },
        relocationWilling: {
            type: String,
            enum: ['yes', 'no', null],
            default: null,
        },
        experienceYears: {
            type: String,
            default: null,
        },
        currentCtcLpa: {
            type: String,
            default: null,
        },
        expectedCtcLpa: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        nextRoundAvailability: {
            type: String,
            default: null,
        },
        communicationScore: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        technicalScore: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        interested: {
            type: String,
            enum: ['yes', 'no', null],
            default: null,
        },
        callStatus: {
            type: String,
            enum: ['Completed', 'Rescheduled', 'Not Interested', 'Screen Rejected', 'Disconnected', null],
            default: null,
        },
        disconnectionReason: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['screening', 'interview_scheduled', 'interviewed', 'selected', 'rejected'],
            default: 'screening',
        },
        lastCallId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Call',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Candidate', candidateSchema);
