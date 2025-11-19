import { useCrud } from './useCrud';

export function useMovies() {
  const crud = useCrud('/movies', {
    hasPagination: true,
    dataKey: 'movies',
    errorMessages: {
      fetch: 'Ошибка загрузки фильмов',
      fetchOne: 'Ошибка загрузки фильма',
      create: 'Ошибка создания фильма',
      update: 'Ошибка обновления фильма',
      delete: 'Ошибка удаления фильма'
    }
  });

  return {
    movies: crud.items,
    movie: crud.item,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchMovies: crud.fetchItems,
    fetchMovie: crud.fetchItem,
    createMovie: crud.createItem,
    updateMovie: crud.updateItem,
    deleteMovie: crud.deleteItem
  };
}
