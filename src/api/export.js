import api from './axios';

export const exportRoutes = () =>
  api.get('/export/routes', { responseType: 'blob' });

export const exportAddresses = () =>
  api.get('/export/addresses', { responseType: 'blob' });
