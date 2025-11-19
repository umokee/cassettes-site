import { useCrud } from './useCrud';

export function useEmployees() {
  const crud = useCrud('/employees', {
    hasPagination: true,
    dataKey: 'employees',
    errorMessages: {
      fetch: 'Ошибка загрузки сотрудников',
      fetchOne: 'Ошибка загрузки сотрудника',
      create: 'Ошибка создания сотрудника',
      update: 'Ошибка обновления сотрудника',
      delete: 'Ошибка удаления сотрудника'
    }
  });

  return {
    employees: crud.items,
    employee: crud.item,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchEmployees: crud.fetchItems,
    fetchEmployee: crud.fetchItem,
    createEmployee: crud.createItem,
    updateEmployee: crud.updateItem,
    deleteEmployee: crud.deleteItem
  };
}
