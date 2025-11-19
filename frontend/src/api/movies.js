import api from './axios'

export default {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.patch(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`)
}
