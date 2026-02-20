import api from './api';

export const getAllCandidates = async () => {
    const response = await api.get('/api/candidates');
    return response.data;
};

export const getCandidateById = async (id) => {
    const response = await api.get(`/api/candidates/${id}`);
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/api/candidates/stats');
    return response.data;
};

export const getNotInterestedCandidates = async () => {
    const response = await api.get('/api/candidates/not-interested');
    return response.data;
};

export const getUnsuccessfulCalls = async () => {
    const response = await api.get('/api/candidates/unsuccessful-calls');
    return response.data;
};

export const getConversationByCandidate = async (id) => {
    const response = await api.get(`/api/candidates/${id}/conversation`);
    return response.data;
};
