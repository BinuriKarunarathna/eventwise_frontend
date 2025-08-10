import axios from "axios";

const API = "http://localhost:3001/api/expenses";

export const getAllExpenses = (eventId) => axios.get(`${API}/event/${eventId}`);
export const getExpenseById = (id) => axios.get(`${API}/${id}`);
export const createExpense = (expenseData) => axios.post(`${API}`, expenseData);
export const updateExpense = (id, updatedData) => axios.put(`${API}/${id}`, updatedData);
export const deleteExpense = (id) => axios.delete(`${API}/${id}`);
