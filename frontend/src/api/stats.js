import api from './axios'
export default {
  getDashboard: () => api.get('/stats/dashboard'),
  getActivity: (params) => api.get('/stats/activity', { params })
}
