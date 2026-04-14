import api from './api';

export const incidentService = {
  getAll: (params = {}) => api.get('/api/incidents', { params }),
  getById: (id)          => api.get(`/api/incidents/${id}`),
  create: (data)         => api.post('/api/incidents', data),
  update: (id, data)     => api.patch(`/api/incidents/${id}`, data),
  addUpdate: (id, msg)   => api.post(`/api/incidents/${id}/updates`, { message: msg }),
  remove: (id)           => api.delete(`/api/incidents/${id}`),
};
