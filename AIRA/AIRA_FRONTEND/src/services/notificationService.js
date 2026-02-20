import api from './api';

export const getAllNotifications = async () => {
    const response = await api.get('/api/notifications');
    return response.data;
};

export const getUnreadNotifications = async () => {
    const response = await api.get('/api/notifications/unread');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
};
