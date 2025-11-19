import api from './axios'

export default {
  getAll: (params) => api.get('/rentals', { params }),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (data) => api.post('/rentals', data),
  returnCassette: (id, data) => api.post(`/rentals/${id}/return`, data),
  getOverdue: () => api.get('/rentals/overdue'),
  delete: (id) => api.delete(`/rentals/${id}`)
}
