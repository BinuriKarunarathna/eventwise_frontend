import api from './api';

export const getAllEvents = (userId) => api.get(`/events/user/${userId}`);
export const getAllEventsFromAllUsers = () => api.get('/events'); // Get all events from all users
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (eventData) => api.post('/events', eventData);
export const updateEvent = (id, updatedData) => api.put(`/events/${id}`, updatedData);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
