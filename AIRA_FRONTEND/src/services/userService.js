import api from './api';

// Get all users (admin only)
export const getAllUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

// Create user (admin only)
export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

// Get default permissions for a role
export const getDefaultPermissions = async (role) => {
    const response = await api.get(`/users/permissions/defaults/${role}`);
    return response.data;
};

// Update user permissions
export const updateUserPermissions = async (userId, permissions) => {
    const response = await api.put(`/users/${userId}/permissions`, permissions);
    return response.data;
};

// Toggle user status
export const toggleUserStatus = async (userId) => {
    const response = await api.post(`/users/${userId}/toggle-status`);
    return response.data;
};
