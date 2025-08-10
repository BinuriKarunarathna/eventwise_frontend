import api from './api';

export const registerUser = (userData) => api.post('/users/register', userData);
export const loginUser = (loginData) => api.post('/users/login', loginData);
export const getUserDetails = (userId) => api.get(`/users/${userId}`);