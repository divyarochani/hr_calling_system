/**
 * Cleanup Script for Stuck Active Calls
 * 
 * This script finds calls that are stuck in 'initiated', 'ringing', 'connected', or 'ongoing'
 * status for more than 1 hour and marks them as 'failed'.
 * 
 * Run: node scripts/cleanupStuckCalls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Call = require('../models/Call');

const MONGODB_URI = process.env.MONGODB_URI;
const STUCK_CALL_THRESHOLD_MINUTES = 60; // 1 hour

async function cleanupStuckCalls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Calculate threshold time (1 hour ago)
        const thresholdTime = new Date(Date.now() - STUCK_CALL_THRESHOLD_MINUTES * 60 * 1000);

        // Find stuck calls
        const stuckCalls = await Call.find({
            status: { $in: ['initiated', 'ringing', 'connected', 'ongoing'] },
            createdAt: { $lt: thresholdTime }
        });

        console.log(`\n🔍 Found ${stuckCalls.length} stuck calls older than ${STUCK_CALL_THRESHOLD_MINUTES} minutes\n`);

        if (stuckCalls.length === 0) {
            console.log('✅ No stuck calls found. Database is clean!');
            process.exit(0);
        }

        // Display stuck calls
        stuckCalls.forEach((call, index) => {
            const ageMinutes = Math.floor((Date.now() - call.createdAt) / 1000 / 60);
            console.log(`${index + 1}. CallSid: ${call.callSid}`);
            console.log(`   Phone: ${call.phoneNumber}`);
            console.log(`   Status: ${call.status}`);
            console.log(`   Age: ${ageMinutes} minutes`);
            console.log(`   Created: ${call.createdAt}`);
            console.log('');
        });

        // Update stuck calls to 'failed'
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

        console.log(`✅ Updated ${result.modifiedCount} stuck calls to 'failed' status`);
        console.log('\n🎉 Cleanup completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run cleanup
cleanupStuckCalls();
