import api from './api';

export const getAllCalls = async () => {
    const response = await api.get('/api/calls');
    return response.data;
};

export const getActiveCalls = async () => {
    const response = await api.get('/api/calls/active');
    return response.data;
};
