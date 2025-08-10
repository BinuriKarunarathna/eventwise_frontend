import api from './api';

export const getAllExpenses = (eventId) => api.get(`/expenses/event/${eventId}`);
export const getExpenseById = (id) => api.get(`/expenses/${id}`);
export const createExpense = (expenseData) => api.post('/expenses', expenseData);
export const updateExpense = (id, updatedData) => api.put(`/expenses/${id}`, updatedData);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
