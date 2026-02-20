import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/api/users');
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
};

export const toggleUserStatus = async (id) => {
    const response = await api.patch(`/api/users/${id}/toggle-status`);
    return response.data;
};

export const getUserPermissions = async (id) => {
    const response = await api.get(`/api/users/${id}/permissions`);
    return response.data;
};

export const updateUserPermissions = async (id, permissions) => {
    const response = await api.put(`/api/users/${id}/permissions`, { permissions });
    return response.data;
};

export const getDefaultPermissions = async (role) => {
    const response = await api.get(`/api/users/role/${role}/permissions`);
    return response.data;
};
