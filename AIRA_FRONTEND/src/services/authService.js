import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

// Login user
export const login = async (email, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    // FastAPI returns: {access_token, token_type, user}
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

// Register user
export const register = async (name, email, password, role) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password, role });
    // After registration, need to login separately
    return response.data;
};

// Get user profile
export const getProfile = async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
};

// Logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get stored token
export const getStoredToken = () => {
    return localStorage.getItem('token');
};

// Get stored user
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
