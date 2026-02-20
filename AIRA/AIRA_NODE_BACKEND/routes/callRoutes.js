const express = require('express');
const router = express.Router();
const axios = require('axios');
const {
    updateCallStatus,
    saveCallData,
    getAllCalls,
    getActiveCalls,
    getCallById,
} = require('../controllers/callController');

// Public routes (for Python backend)
router.post('/status', updateCallStatus);
router.post('/data', saveCallData);

// Protected routes (add auth middleware later if needed)
router.get('/', getAllCalls);
router.get('/active', getActiveCalls);
router.get('/:id', getCallById);

// Retry call endpoint
router.post('/retry', async (req, res) => {
    try {
        const { phoneNumber, candidateId } = req.body;
        
        // Call Python backend to initiate call
        const response = await axios.post(
            `${process.env.PYTHON_BACKEND_URL || 'http://localhost:5001'}/call/outbound`,
            null,
            { params: { phone_number: phoneNumber } }
        );

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Outbound call endpoint (proxy to Python backend)
router.post('/outbound', async (req, res) => {
    try {
        const phoneNumber = req.query.phone_number;
        
        // Call Python backend
        const response = await axios.post(
            `${process.env.PYTHON_BACKEND_URL || 'http://localhost:5001'}/call/outbound`,
            null,
            { params: { phone_number: phoneNumber } }
        );

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
