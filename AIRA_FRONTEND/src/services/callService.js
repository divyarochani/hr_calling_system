import api from './api';

// Get all calls
export const getAllCalls = async (params = {}) => {
    const response = await api.get('/calls', { params });
    // FastAPI returns: {calls: [...], total: number}
    return response.data;
};

// Get active calls
export const getActiveCalls = async () => {
    const response = await api.get('/calls/active');
    // FastAPI returns: {calls: [...], total: number}
    return response.data;
};

// Initiate a call
export const initiateCall = async (phoneNumber) => {
    const response = await api.post('/calls/initiate', { phone_number: phoneNumber });
    // FastAPI returns: {success: bool, message: string, call_sid: string, phone_number: string}
    return response.data;
};

// Get call by ID
export const getCallById = async (callId) => {
    const response = await api.get(`/calls/${callId}`);
    return response.data;
};

// Get recording URL with SAS token (time-limited access)
export const getRecordingUrl = async (callId) => {
    const response = await api.get(`/calls/${callId}/recording-url`);
    // FastAPI returns: {recording_url: string}
    return response.data;
};
