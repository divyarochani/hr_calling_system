import api from './api';

// Get all candidates
export const getAllCandidates = async (params = {}) => {
    const response = await api.get('/candidates', { params });
    // FastAPI returns: {candidates: [...], total: number}
    return response.data;
};

// Get candidate by ID
export const getCandidateById = async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
};

// Get dashboard stats
export const getDashboardStats = async () => {
    const response = await api.get('/candidates/stats');
    return response.data;
};

// Get not interested candidates
export const getNotInterestedCandidates = async (params = {}) => {
    const response = await api.get('/candidates/not-interested', { params });
    // FastAPI returns: {candidates: [...], total: number}
    return response.data;
};

// Get unsuccessful calls
export const getUnsuccessfulCalls = async (params = {}) => {
    const response = await api.get('/candidates/unsuccessful', { params });
    // FastAPI returns: {candidates: [...], total: number}
    return response.data;
};

// Get candidate calls/conversation
export const getConversationByCandidate = async (id) => {
    const response = await api.get(`/candidates/${id}/calls`);
    // FastAPI returns: {candidate: {...}, calls: [...], total_calls: number}
    return response.data;
};

// Create candidate
export const createCandidate = async (candidateData) => {
    const response = await api.post('/candidates', candidateData);
    return response.data;
};

// Update candidate
export const updateCandidate = async (id, candidateData) => {
    const response = await api.put(`/candidates/${id}`, candidateData);
    return response.data;
};

// Delete candidate
export const deleteCandidate = async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
};
