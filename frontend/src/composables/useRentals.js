import { useCrud } from './useCrud';
import api from '@/api/axios';

export function useRentals() {
  const crud = useCrud('/rentals', {
    hasPagination: true,
    dataKey: 'rentals',
    errorMessages: {
      fetch: 'Ошибка загрузки проката',
      fetchOne: 'Ошибка загрузки проката',
      create: 'Ошибка создания проката',
      update: 'Ошибка обновления проката',
      delete: 'Ошибка удаления проката'
    }
  });

  const returnRental = async (id, returnData) => {
    crud.loading.value = true;
    crud.error.value = null;
    try {
      const { data } = await api.patch(`/rentals/${id}/return`, returnData);
      return data;
    } catch (err) {
      crud.error.value = err.response?.data?.message || 'Ошибка возврата проката';
      throw err;
    } finally {
      crud.loading.value = false;
    }
  };

  return {
    rentals: crud.items,
    rental: crud.item,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchRentals: crud.fetchItems,
    fetchRental: crud.fetchItem,
    createRental: crud.createItem,
    deleteRental: crud.deleteItem,
    returnRental
  };
}
