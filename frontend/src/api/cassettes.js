import api from './axios'

export default {
  getAll: (params) => api.get('/cassettes', { params }),
  getById: (id) => api.get(`/cassettes/${id}`),
  create: (data) => api.post('/cassettes', data),
  update: (id, data) => api.patch(`/cassettes/${id}`, data),
  delete: (id) => api.delete(`/cassettes/${id}`)
}
