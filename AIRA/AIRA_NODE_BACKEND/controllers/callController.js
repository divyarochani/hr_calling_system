const Call = require('../models/Call');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const path = require('path');

// Update call status - ALWAYS CREATE NEW DOCUMENT
exports.updateCallStatus = async (req, res) => {
    try {
        const { callSid, status, phoneNumber, callType } = req.body;

        // Check if document already exists for this callSid
        let call = await Call.findOne({ callSid });

        if (!call) {
            // Create new document - first time seeing this callSid
            call = new Call({
                callSid,
                phoneNumber,
                status,
                callType: callType || 'outbound',
                startTime: new Date(),
            });
            await call.save();
            console.log(`✅ Created new call document: ${callSid}`);
        } else {
            // Update existing document
            call.status = status;
            if (phoneNumber) call.phoneNumber = phoneNumber;
            
            // Update end time and duration for completed/failed/missed calls
            if (status === 'completed' || status === 'missed' || status === 'failed') {
                call.endTime = new Date();
                if (call.startTime) {
                    call.duration = Math.floor((call.endTime - call.startTime) / 1000);
                }
            }
            
            await call.save();
            console.log(`✅ Updated call document: ${callSid} -> ${status}`);
        }

        // Emit socket event
        if (req.io) {
            req.io.emit('call:status', {
                callSid: call.callSid,
                phoneNumber: call.phoneNumber,
                status: call.status,
                duration: call.duration,
            });
        }

        // Create notification for missed calls
        if (status === 'missed') {
            const notification = new Notification({
                type: 'missed_call',
                title: 'Missed Call',
                message: `Candidate ${phoneNumber} missed the call`,
                callId: call._id,
                priority: 'high',
            });
            await notification.save();

            if (req.io) {
                req.io.emit('notification:new', notification);
            }
        }

        res.json({
            success: true,
            data: call,
        });
    } catch (error) {
        console.error('Error updating call status:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Save call data after completion - UPDATE EXISTING DOCUMENT
exports.saveCallData = async (req, res) => {
    try {
        const {
            callSid,
            phoneNumber,
            startTime,
            endTime,
            duration,
            transferRequested,
            transferNumber,
            structuredData,
            conversation,
        } = req.body;

        // Extract just the filename from recording path
        let recordingFilename = null;
        if (req.body.recordingPath) {
            const pathParts = req.body.recordingPath.replace(/\\/g, '/').split('/');
            recordingFilename = pathParts[pathParts.length - 1];
        }

        // Find existing call document
        let call = await Call.findOne({ callSid });

        if (!call) {
            // If somehow doesn't exist, create it
            call = new Call({
                callSid,
                phoneNumber,
                status: 'completed',
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration,
                transferRequested,
                transferNumber,
                summary: JSON.stringify(conversation),
                recordingPath: req.body.recordingPath || null,
                recordingUrl: recordingFilename ? `http://localhost:5000/recordings/${recordingFilename}` : null,
                transcriptUrl: recordingFilename ? `http://localhost:5000/recordings/${recordingFilename.replace('.wav', '_transcript.json')}` : null,
            });
            console.log(`⚠️  Call document didn't exist, creating: ${callSid}`);
        } else {
            // Update existing document with call data
            call.phoneNumber = phoneNumber;
            call.status = 'completed';
            call.startTime = new Date(startTime);
            call.endTime = new Date(endTime);
            call.duration = duration;
            call.transferRequested = transferRequested;
            call.transferNumber = transferNumber;
            call.summary = JSON.stringify(conversation);
            call.recordingPath = req.body.recordingPath || null;
            call.recordingUrl = recordingFilename ? `http://localhost:5000/recordings/${recordingFilename}` : null;
            call.transcriptUrl = recordingFilename ? `http://localhost:5000/recordings/${recordingFilename.replace('.wav', '_transcript.json')}` : null;
            console.log(`✅ Updated call document with data: ${callSid}`);
        }
        await call.save();

        // Create or update candidate - ALWAYS CREATE NEW CANDIDATE FOR EACH CALL
        let candidate = new Candidate({ 
            phoneNumber,
            lastCallId: call._id,
        });

        // Update candidate with structured data
        if (structuredData) {
            candidate.candidateName = structuredData.candidate_name || null;
            candidate.currentCompany = structuredData.current_company || null;
            candidate.currentRole = structuredData.current_role || null;
            candidate.desiredRole = structuredData.desired_role || null;
            candidate.domain = structuredData.domain || null;
            candidate.noticePeriod = structuredData.notice_period || null;
            candidate.currentLocation = structuredData.current_location || null;
            candidate.relocationWilling = structuredData.relocation_willing || null;
            candidate.experienceYears = structuredData.experience_years || null;
            candidate.currentCtcLpa = structuredData.current_ctc_lpa || null;
            candidate.expectedCtcLpa = structuredData.expected_ctc_lpa || null;
            candidate.email = structuredData.email || null;
            candidate.nextRoundAvailability = structuredData.next_round_availability || null;
            candidate.communicationScore = structuredData.communication_score || null;
            candidate.technicalScore = structuredData.technical_score || null;
            candidate.overallScore = structuredData.overall_score || null;
            candidate.interested = structuredData.interested || null;
            candidate.callStatus = structuredData.call_status || null;
            candidate.disconnectionReason = structuredData.disconnection_reason || null;
        }

        await candidate.save();
        console.log(`✅ Created new candidate: ${candidate._id}`);

        // Link candidate to call
        call.candidateId = candidate._id;
        await call.save();

        // Emit socket events
        if (req.io) {
            req.io.emit('call:completed', {
                call,
                candidate,
            });

            req.io.emit('candidate:updated', candidate);
        }

        // Create notification
        const notification = new Notification({
            type: 'screening_done',
            title: 'Screening Completed',
            message: `Screening completed for ${candidate.candidateName || phoneNumber}`,
            callId: call._id,
            candidateId: candidate._id,
            priority: 'medium',
        });
        await notification.save();

        if (req.io) {
            req.io.emit('notification:new', notification);
        }

        res.json({
            success: true,
            data: {
                call,
                candidate,
            },
        });
    } catch (error) {
        console.error('Error saving call data:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all calls
exports.getAllCalls = async (req, res) => {
    try {
        const calls = await Call.find()
            .populate('candidateId')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            data: calls,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get call by ID
exports.getCallById = async (req, res) => {
    try {
        const call = await Call.findById(req.params.id)
            .populate('candidateId');

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found',
            });
        }

        res.json({
            success: true,
            data: call,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get active calls
exports.getActiveCalls = async (req, res) => {
    try {
        const activeCalls = await Call.find({
            status: { $in: ['initiated', 'ringing', 'connected', 'ongoing'] },
        })
            .populate('candidateId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: activeCalls,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
