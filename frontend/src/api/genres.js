import api from './axios'

export default {
  getAll: (params) => api.get('/genres', { params }),
  getById: (id) => api.get(`/genres/${id}`),
  create: (data) => api.post('/genres', data),
  update: (id, data) => api.patch(`/genres/${id}`, data),
  delete: (id) => api.delete(`/genres/${id}`)
}
