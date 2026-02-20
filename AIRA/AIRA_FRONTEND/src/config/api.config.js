export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        PROFILE: '/api/auth/profile',
    },
    CANDIDATES: {
        GET_ALL: '/api/candidates',
        GET_BY_ID: '/api/candidates/:id',
        GET_STATS: '/api/candidates/stats',
    },
    CALLS: {
        GET_ALL: '/api/calls',
        GET_ACTIVE: '/api/calls/active',
    },
    NOTIFICATIONS: {
        GET_ALL: '/api/notifications',
        GET_UNREAD: '/api/notifications/unread',
        MARK_READ: '/api/notifications/:id/read',
        MARK_ALL_READ: '/api/notifications/read-all',
    },
};
