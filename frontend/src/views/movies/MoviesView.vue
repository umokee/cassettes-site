<template>
  <AppLayout>
    <div class="movies-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="film" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Фильмы</h1>
            <p class="page-subtitle">Управление каталогом фильмов</p>
          </div>
        </div>
        <AppButton @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить фильм
        </AppButton>
      </div>
      <FilterBar
        :search-config="{ value: search, placeholder: 'Поиск по названию или режиссёру...' }"
        :filters="[{ key: 'genreId', value: filters.genreId, placeholder: 'Все жанры', options: genreOptions }]"
        @update:search="search = $event"
        @update:filter="updateFilter"
        @search="handleSearch"
      />
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="movies"
          :actions="['view', 'edit', 'delete']"
          @view="viewMovie"
          @edit="editMovie"
          @delete="deleteMovie"
        />
      </div>
      <AppPagination
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        @change="handlePageChange"
      />
      <MovieModal
        v-model="showModal"
        :movie="selectedMovie"
        @submit="handleSubmit"
      />
      <MovieDetailModal
        v-model="showDetailModal"
        :movie="selectedMovie"
      />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import AppButton from '@/components/common/AppButton.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import MovieModal from '@/components/movies/MovieModal.vue'
import MovieDetailModal from '@/components/movies/MovieDetailModal.vue'
import moviesAPI from '@/api/movies'
import genresAPI from '@/api/genres'
import notifications from '@/utils/notifications'
const columns = [
  { key: 'title', label: 'Название' },
  { key: 'genres', label: 'Жанр' },
  { key: 'year', label: 'Год' },
  { key: 'director', label: 'Режиссёр' },
  { key: 'duration', label: 'Длительность (мин)' }
]
const movies = ref([])
const search = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedMovie = ref(null)
const genreOptions = ref([])
const filters = reactive({
  genreId: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})
const fetchMovies = async () => {
  try {
    const { data } = await moviesAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search: search.value,
      genre: filters.genreId
    })
    movies.value = data.movies
    Object.assign(pagination, data.pagination)
  } catch (error) {
    notifications.error('Ошибка загрузки фильмов')
  }
}
const fetchGenres = async () => {
  try {
    const { data } = await genresAPI.getAll({ limit: 1000 })
    genreOptions.value = data.genres.map(g => ({ value: g._id, label: g.name }))
  } catch (error) {

  }
}
const openCreateModal = () => {
  selectedMovie.value = null
  showModal.value = true
}
const viewMovie = (movie) => {
  selectedMovie.value = movie
  showDetailModal.value = true
}
const editMovie = (movie) => {
  selectedMovie.value = movie
  showModal.value = true
}
const deleteMovie = async (movie) => {
  if (!confirm(`Удалить фильм "${movie.title}"?`)) return
  try {
    await moviesAPI.delete(movie._id)
    notifications.success('Фильм удалён')
    fetchMovies()
  } catch (error) {
    notifications.error('Ошибка удаления фильма')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchMovies()
}
const handleSearch = () => {
  pagination.page = 1
  fetchMovies()
}
const updateFilter = (key, value) => {
  filters[key] = value
  pagination.page = 1
  fetchMovies()
}
const handlePageChange = (page) => {
  pagination.page = page
  fetchMovies()
}
onMounted(() => {
  fetchGenres()
  fetchMovies()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
