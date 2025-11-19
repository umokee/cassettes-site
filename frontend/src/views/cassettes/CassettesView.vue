<template>
  <AppLayout>
    <div class="cassettes-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="package" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Кассеты</h1>
            <p class="page-subtitle">Управление физическими носителями</p>
          </div>
        </div>
        <AppButton @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить кассету
        </AppButton>
      </div>
      <FilterBar
        :search-config="{ value: search, placeholder: 'Поиск по фильмам...' }"
        :filters="[
          { key: 'status', value: filters.status, placeholder: 'Все статусы', options: statusOptions },
          { key: 'movieId', value: filters.movieId, placeholder: 'Все фильмы', options: movieOptions }
        ]"
        @update:search="search = $event"
        @update:filter="updateFilter"
        @search="handleSearch"
      />
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="cassettes"
          :actions="['view', 'edit', 'delete']"
          @view="viewCassette"
          @edit="editCassette"
          @delete="deleteCassette"
        />
      </div>
      <AppPagination
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        @change="handlePageChange"
      />
      <CassetteModal
        v-model="showModal"
        :cassette="selectedCassette"
        @submit="handleSubmit"
      />
      <CassetteDetailModal
        v-model="showDetailModal"
        :cassette="selectedCassette"
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
import CassetteModal from '@/components/cassettes/CassetteModal.vue'
import CassetteDetailModal from '@/components/cassettes/CassetteDetailModal.vue'
import cassettesAPI from '@/api/cassettes'
import moviesAPI from '@/api/movies'
import notifications from '@/utils/notifications'
const statusOptions = [
  { value: 'available', label: 'Доступна' },
  { value: 'rented', label: 'Арендована' },
  { value: 'damaged', label: 'Повреждена' },
  { value: 'lost', label: 'Утеряна' }
]
const columns = [
  { key: 'serialNumber', label: 'Инв. номер' },
  { key: 'movie.title', label: 'Фильм' },
  { key: 'format', label: 'Формат' },
  { key: 'status', label: 'Статус', format: 'status' },
  { key: 'purchaseDate', label: 'Дата покупки', format: 'date' },
  { key: 'purchasePrice', label: 'Цена', format: 'currency' }
]
const cassettes = ref([])
const search = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedCassette = ref(null)
const movieOptions = ref([])
const filters = reactive({
  status: '',
  movieId: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})
const fetchCassettes = async () => {
  try {
    const { data } = await cassettesAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search: search.value,
      status: filters.status,
      movie: filters.movieId
    })
    cassettes.value = data.cassettes
    Object.assign(pagination, data.pagination)
  } catch (error) {
    notifications.error('Ошибка загрузки кассет')
  }
}
const fetchMovies = async () => {
  try {
    const { data } = await moviesAPI.getAll({ limit: 1000 })
    movieOptions.value = data.movies.map(m => ({ value: m._id, label: m.title }))
  } catch (error) {

  }
}
const openCreateModal = () => {
  selectedCassette.value = null
  showModal.value = true
}
const viewCassette = (cassette) => {
  selectedCassette.value = cassette
  showDetailModal.value = true
}
const editCassette = (cassette) => {
  selectedCassette.value = cassette
  showModal.value = true
}
const deleteCassette = async (cassette) => {
  if (!confirm(`Удалить кассету ${cassette.serialNumber}?`)) return
  try {
    await cassettesAPI.delete(cassette._id)
    notifications.success('Кассета удалена')
    fetchCassettes()
  } catch (error) {
    notifications.error('Ошибка удаления кассеты')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchCassettes()
}
const handleSearch = () => {
  pagination.page = 1
  fetchCassettes()
}
const updateFilter = (key, value) => {
  filters[key] = value
  pagination.page = 1
  fetchCassettes()
}
const handlePageChange = (page) => {
  pagination.page = page
  fetchCassettes()
}
onMounted(() => {
  fetchMovies()
  fetchCassettes()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
