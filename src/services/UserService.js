import axios from "axios";

const API = "http://localhost:3001/api/users";

export const registerUser = (userData) => axios.post(`${API}/register`, userData);
export const loginUser = (loginData) => axios.post(`${API}/login`, loginData);
export const getUserDetails = (userId) => axios.get(`${API}/${userId}`);
