import { useCrud } from './useCrud';

export function useCassettes() {
  const crud = useCrud('/cassettes', {
    hasPagination: true,
    dataKey: 'cassettes',
    errorMessages: {
      fetch: 'Ошибка загрузки кассет',
      fetchOne: 'Ошибка загрузки кассеты',
      create: 'Ошибка создания кассеты',
      update: 'Ошибка обновления кассеты',
      delete: 'Ошибка удаления кассеты'
    }
  });

  return {
    cassettes: crud.items,
    cassette: crud.item,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchCassettes: crud.fetchItems,
    fetchCassette: crud.fetchItem,
    createCassette: crud.createItem,
    updateCassette: crud.updateItem,
    deleteCassette: crud.deleteItem
  };
}
