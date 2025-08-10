import axios from "axios";

const API = process.env.REACT_APP_API_URL + "/users";

export const registerUser = (userData) => axios.post(`${API}/register`, userData);
export const loginUser = (loginData) => axios.post(`${API}/login`, loginData);
export const getUserDetails = (userId) => axios.get(`${API}/${userId}`);
