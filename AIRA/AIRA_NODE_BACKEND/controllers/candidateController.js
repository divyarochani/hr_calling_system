const Candidate = require('../models/Candidate');
const Call = require('../models/Call');

// Get all candidates
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find()
            .populate('lastCallId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: candidates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get candidate by ID
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('lastCallId');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        // Get all calls for this candidate
        const calls = await Call.find({ candidateId: candidate._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                candidate,
                calls,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total candidates
        const totalCandidates = await Candidate.countDocuments();

        // Candidates today
        const candidatesToday = await Candidate.countDocuments({
            createdAt: { $gte: today },
        });

        // Total calls
        const totalCalls = await Call.countDocuments();

        // Calls today
        const callsToday = await Call.countDocuments({
            createdAt: { $gte: today },
        });

        // Active calls
        const activeCalls = await Call.countDocuments({
            status: { $in: ['initiated', 'ringing', 'connected', 'ongoing'] },
        });

        // Completed screenings
        const screeningsCompleted = await Candidate.countDocuments({
            overallScore: { $ne: null },
        });

        // Screenings today
        const screeningsToday = await Candidate.countDocuments({
            overallScore: { $ne: null },
            updatedAt: { $gte: today },
        });

        // Interviews (candidates with high scores)
        const interviewsScheduled = await Candidate.countDocuments({
            overallScore: { $gte: 7 },
            status: { $in: ['interview_scheduled', 'interviewed'] },
        });

        // Average scores
        const scoreStats = await Candidate.aggregate([
            {
                $match: {
                    overallScore: { $ne: null },
                },
            },
            {
                $group: {
                    _id: null,
                    avgCommunication: { $avg: '$communicationScore' },
                    avgTechnical: { $avg: '$technicalScore' },
                    avgOverall: { $avg: '$overallScore' },
                },
            },
        ]);

        const avgScores = scoreStats.length > 0 ? scoreStats[0] : {
            avgCommunication: 0,
            avgTechnical: 0,
            avgOverall: 0,
        };

        // Missed calls today
        const missedCallsToday = await Call.countDocuments({
            status: 'missed',
            createdAt: { $gte: today },
        });

        res.json({
            success: true,
            data: {
                totalCandidates,
                candidatesToday,
                totalCalls,
                callsToday,
                activeCalls,
                screeningsCompleted,
                screeningsToday,
                interviewsScheduled,
                avgCommunicationScore: avgScores.avgCommunication?.toFixed(1) || 0,
                avgTechnicalScore: avgScores.avgTechnical?.toFixed(1) || 0,
                avgOverallScore: avgScores.avgOverall?.toFixed(1) || 0,
                missedCallsToday,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get not interested candidates
exports.getNotInterestedCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({
            $or: [
                { interested: 'no' },
                { callStatus: 'Not Interested' },
                { callStatus: 'Screen Rejected' }
            ]
        })
            .populate('lastCallId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: candidates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get unsuccessful calls
exports.getUnsuccessfulCalls = async (req, res) => {
    try {
        const candidates = await Candidate.find({
            $or: [
                { callStatus: 'Rescheduled' },
                { callStatus: 'Disconnected' }
            ]
        })
            .populate('lastCallId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: candidates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get conversation by candidate ID
exports.getConversationByCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('lastCallId');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        // Get the call with conversation
        const call = await Call.findById(candidate.lastCallId);
        
        let conversation = [];
        if (call && call.summary) {
            try {
                conversation = JSON.parse(call.summary);
            } catch (e) {
                console.error('Error parsing conversation:', e);
            }
        }

        res.json({
            success: true,
            data: {
                candidate,
                call,
                conversation,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
