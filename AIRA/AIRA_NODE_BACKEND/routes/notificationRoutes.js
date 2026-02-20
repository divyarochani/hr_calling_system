const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.get('/unread', getUnreadNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
