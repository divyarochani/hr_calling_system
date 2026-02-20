const express = require('express');
const router = express.Router();
const {
    getAllCandidates,
    getCandidateById,
    getDashboardStats,
    getNotInterestedCandidates,
    getUnsuccessfulCalls,
    getConversationByCandidate,
} = require('../controllers/candidateController');

router.get('/', getAllCandidates);
router.get('/stats', getDashboardStats);
router.get('/not-interested', getNotInterestedCandidates);
router.get('/unsuccessful-calls', getUnsuccessfulCalls);
router.get('/:id', getCandidateById);
router.get('/:id/conversation', getConversationByCandidate);

module.exports = router;
