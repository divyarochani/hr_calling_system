export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/me',
    },
    CANDIDATES: {
        GET_ALL: '/candidates',
        GET_BY_ID: '/candidates/:id',
        GET_STATS: '/candidates/stats',
        NOT_INTERESTED: '/candidates/not-interested',
        UNSUCCESSFUL: '/candidates/unsuccessful',
        GET_CALLS: '/candidates/:id/calls',
    },
    CALLS: {
        GET_ALL: '/calls',
        GET_ACTIVE: '/calls/active',
        INITIATE: '/calls/initiate',
        GET_BY_ID: '/calls/:id',
    },
    NOTIFICATIONS: {
        GET_ALL: '/notifications',
        GET_UNREAD: '/notifications/unread',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/read-all',
    },
};
