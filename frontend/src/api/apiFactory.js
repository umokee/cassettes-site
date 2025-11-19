import api from './axios';

export function createApiModule(resourcePath, customMethods = {}) {
  return {
    getAll: (params) => api.get(resourcePath, { params }),
    getById: (id) => api.get(`${resourcePath}/${id}`),
    create: (data) => api.post(resourcePath, data),
    update: (id, data) => api.patch(`${resourcePath}/${id}`, data),
    delete: (id) => api.delete(`${resourcePath}/${id}`),
    ...customMethods
  };
}
