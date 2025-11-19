import { ref } from 'vue';
import api from '@/api/axios';

export function useCrud(resourcePath, options = {}) {
  const {
    hasPagination = true,
    dataKey = null,
    errorMessages = {}
  } = options;

  const items = ref([]);
  const item = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref(hasPagination ? {
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  } : null);

  const defaultErrorMessages = {
    fetch: 'Ошибка загрузки данных',
    fetchOne: 'Ошибка загрузки записи',
    create: 'Ошибка создания записи',
    update: 'Ошибка обновления записи',
    delete: 'Ошибка удаления записи'
  };

  const messages = { ...defaultErrorMessages, ...errorMessages };

  const fetchItems = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get(resourcePath, { params: filters });

      if (hasPagination && dataKey) {
        items.value = data[dataKey];
        pagination.value = data.pagination;
      } else if (dataKey) {
        items.value = data[dataKey];
      } else {
        items.value = data;
      }

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || messages.fetch;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchItem = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get(`${resourcePath}/${id}`);
      item.value = data;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || messages.fetchOne;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (itemData) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post(resourcePath, itemData);

      if (!hasPagination) {
        items.value.push(data);
      }

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || messages.create;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id, itemData) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch(`${resourcePath}/${id}`, itemData);

      const index = items.value.findIndex(i => i._id === id);
      if (index !== -1) {
        items.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || messages.update;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`${resourcePath}/${id}`);
      items.value = items.value.filter(i => i._id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || messages.delete;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    item,
    loading,
    error,
    pagination,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem
  };
}
