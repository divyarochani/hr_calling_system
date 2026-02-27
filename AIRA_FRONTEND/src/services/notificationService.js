import api from './api';

// Get all notifications
export const getAllNotifications = async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
};

// Get unread notifications
export const getUnreadNotifications = async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

// Alias for compatibility
export const markAsRead = markNotificationAsRead;
export const markAllAsRead = markAllNotificationsAsRead;

