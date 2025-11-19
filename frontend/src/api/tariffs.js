import api from './axios'

export default {
  getAll: (params) => api.get('/tariffs', { params }),
  getById: (id) => api.get(`/tariffs/${id}`),
  getDefault: () => api.get('/tariffs/default'),
  calculate: (data) => api.post('/tariffs/calculate', data),
  create: (data) => api.post('/tariffs', data),
  update: (id, data) => api.patch(`/tariffs/${id}`, data),
  delete: (id) => api.delete(`/tariffs/${id}`)
}
