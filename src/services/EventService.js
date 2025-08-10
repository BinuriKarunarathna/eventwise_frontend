import axios from "axios";

const API = "http://localhost:3001/api/events";

export const getAllEvents = (userId) => axios.get(`${API}/user/${userId}`);
export const getAllEventsFromAllUsers = () => axios.get(`${API}`); // Get all events from all users
export const getEventById = (id) => axios.get(`${API}/${id}`);
export const createEvent = (eventData) => axios.post(`${API}`, eventData);
export const updateEvent = (id, updatedData) => axios.put(`${API}/${id}`, updatedData);
export const deleteEvent = (id) => axios.delete(`${API}/${id}`);
