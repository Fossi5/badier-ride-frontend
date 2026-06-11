import api from './axios';

export const getAlerts = (status) => api.get('/alerts', { params: status ? { status } : {} });
export const createAlert = (data) => api.post('/alerts', data);
export const updateAlertStatus = (id, status) => api.put(`/alerts/${id}/status`, { status });
export const resolveAlert = (id, note) => api.put(`/alerts/${id}/resolve`, { resolutionNote: note });
