import api from './axios';

export const getMessages = (routeId) => api.get(`/routes/${routeId}/messages`);
export const sendMessage = (routeId, content) => api.post(`/routes/${routeId}/messages`, { content });
export const getUnreadCount = (routeId) => api.get(`/routes/${routeId}/messages/unread-count`);
export const getUnreadCountsBulk = (routeIds) => api.get('/messages/unread-counts', { params: { routeIds: routeIds.join(',') } });
