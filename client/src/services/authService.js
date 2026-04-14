import api from './api';

export const authService = {
  login:    (creds) => api.post('/api/auth/login', creds),
  register: (data)  => api.post('/api/auth/register', data),
  me:       ()      => api.get('/api/auth/me'),
};
