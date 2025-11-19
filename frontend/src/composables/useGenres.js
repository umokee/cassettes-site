import { useCrud } from './useCrud';

export function useGenres() {
  const crud = useCrud('/genres', {
    hasPagination: false,
    errorMessages: {
      fetch: 'Ошибка загрузки жанров',
      fetchOne: 'Ошибка загрузки жанра',
      create: 'Ошибка создания жанра',
      update: 'Ошибка обновления жанра',
      delete: 'Ошибка удаления жанра'
    }
  });

  return {
    genres: crud.items,
    genre: crud.item,
    loading: crud.loading,
    error: crud.error,
    fetchGenres: crud.fetchItems,
    fetchGenre: crud.fetchItem,
    createGenre: crud.createItem,
    updateGenre: crud.updateItem,
    deleteGenre: crud.deleteItem
  };
}
