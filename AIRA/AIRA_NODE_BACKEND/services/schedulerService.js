const cron = require('node-cron');
const axios = require('axios');
const Candidate = require('../models/Candidate');
const Call = require('../models/Call');
const chrono = require('chrono-node');

class SchedulerService {
    constructor() {
        this.scheduledCalls = new Map();
        this.startScheduler();
        this.startCallCleanup();
    }

    startScheduler() {
        // Check every minute for scheduled calls
        cron.schedule('* * * * *', async () => {
            await this.checkScheduledCalls();
        });
        
        console.log('📅 Call Scheduler started - checking every minute');
    }

    startCallCleanup() {
        // Cleanup stuck calls every 30 minutes
        cron.schedule('*/30 * * * *', async () => {
            await this.cleanupStuckCalls();
        });
        
        console.log('🧹 Call Cleanup Scheduler started - running every 30 minutes');
    }

    async cleanupStuckCalls() {
        try {
            const STUCK_THRESHOLD_MINUTES = 60; // 1 hour
            const thresholdTime = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000);

            // Find and update stuck calls
            const result = await Call.updateMany(
                {
                    status: { $in: ['initiated', 'ringing', 'connected', 'ongoing'] },
                    createdAt: { $lt: thresholdTime }
                },
                {
                    $set: {
                        status: 'failed',
                        endTime: new Date(),
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`🧹 Cleaned up ${result.modifiedCount} stuck calls`);
            }
        } catch (error) {
            console.error('Error cleaning up stuck calls:', error);
        }
    }

    async checkScheduledCalls() {
        try {
            // Find rescheduled candidates
            const candidates = await Candidate.find({
                callStatus: 'Rescheduled',
                nextRoundAvailability: { $ne: null }
            });

            const now = new Date();

            for (const candidate of candidates) {
                // Parse the availability time
                const scheduledTime = this.parseScheduledTime(candidate.nextRoundAvailability);
                
                if (!scheduledTime) continue;

                // Check if it's time to call (within 1 minute window)
                const timeDiff = scheduledTime - now;
                const isTimeToCall = timeDiff >= 0 && timeDiff <= 60000; // Within next minute

                if (isTimeToCall && !this.scheduledCalls.has(candidate._id.toString())) {
                    console.log(`⏰ Time to call: ${candidate.candidateName || candidate.phoneNumber}`);
                    this.scheduledCalls.set(candidate._id.toString(), true);
                    
                    // Make the call
                    await this.makeScheduledCall(candidate);
                }
            }
        } catch (error) {
            console.error('Scheduler error:', error);
        }
    }

    parseScheduledTime(timeString) {
        try {
            // Use chrono-node to parse natural language dates
            const parsed = chrono.parseDate(timeString);
            
            if (parsed) {
                return parsed;
            }

            // Fallback: try to parse common formats
            // "Tomorrow 3 PM", "Monday 10 AM", "2024-02-20 14:00"
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return date;
            }

            return null;
        } catch (error) {
            console.error('Error parsing time:', error);
            return null;
        }
    }

    async makeScheduledCall(candidate) {
        try {
            console.log(`📞 Making scheduled call to ${candidate.phoneNumber}`);
            
            // Call Python backend
            const response = await axios.post(
                `${process.env.PYTHON_BACKEND_URL || 'http://localhost:5001'}/call/outbound`,
                null,
                { params: { phone_number: candidate.phoneNumber } }
            );

            if (response.data.success) {
                console.log(`✅ Scheduled call initiated: ${response.data.call_sid}`);
                
                // Update candidate status
                candidate.callStatus = null; // Will be updated by call result
                await candidate.save();
                
                // Remove from scheduled map after 5 minutes
                setTimeout(() => {
                    this.scheduledCalls.delete(candidate._id.toString());
                }, 300000);
            }
        } catch (error) {
            console.error(`Failed to make scheduled call to ${candidate.phoneNumber}:`, error.message);
            
            // Remove from map to allow retry
            setTimeout(() => {
                this.scheduledCalls.delete(candidate._id.toString());
            }, 60000); // Retry after 1 minute
        }
    }

    // Manual schedule a call
    scheduleCall(candidateId, phoneNumber, scheduledTime) {
        const timeUntilCall = scheduledTime - new Date();
        
        if (timeUntilCall > 0) {
            setTimeout(async () => {
                const candidate = await Candidate.findById(candidateId);
                if (candidate) {
                    await this.makeScheduledCall(candidate);
                }
            }, timeUntilCall);
            
            console.log(`📅 Call scheduled for ${scheduledTime.toLocaleString()}`);
            return true;
        }
        
        return false;
    }
}

// Singleton instance
let schedulerInstance = null;

function getScheduler() {
    if (!schedulerInstance) {
        schedulerInstance = new SchedulerService();
    }
    return schedulerInstance;
}

module.exports = { getScheduler };
