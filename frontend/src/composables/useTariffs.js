import { useCrud } from './useCrud';

export function useTariffs() {
  const crud = useCrud('/tariffs', {
    hasPagination: false,
    errorMessages: {
      fetch: 'Ошибка загрузки тарифов',
      fetchOne: 'Ошибка загрузки тарифа',
      create: 'Ошибка создания тарифа',
      update: 'Ошибка обновления тарифа',
      delete: 'Ошибка удаления тарифа'
    }
  });

  return {
    tariffs: crud.items,
    tariff: crud.item,
    loading: crud.loading,
    error: crud.error,
    fetchTariffs: crud.fetchItems,
    fetchTariff: crud.fetchItem,
    createTariff: crud.createItem,
    updateTariff: crud.updateItem,
    deleteTariff: crud.deleteItem
  };
}
