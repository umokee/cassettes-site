import { useCrud } from './useCrud';

export function useClients() {
  const crud = useCrud('/clients', {
    hasPagination: true,
    dataKey: 'clients',
    errorMessages: {
      fetch: 'Ошибка загрузки клиентов',
      fetchOne: 'Ошибка загрузки клиента',
      create: 'Ошибка создания клиента',
      update: 'Ошибка обновления клиента',
      delete: 'Ошибка удаления клиента'
    }
  });

  return {
    clients: crud.items,
    client: crud.item,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchClients: crud.fetchItems,
    fetchClient: crud.fetchItem,
    createClient: crud.createItem,
    updateClient: crud.updateItem,
    deleteClient: crud.deleteItem
  };
}
