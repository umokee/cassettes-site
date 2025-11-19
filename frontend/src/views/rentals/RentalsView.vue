<template>
  <AppLayout>
    <div class="rentals-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="disc" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Аренды</h1>
            <p class="page-subtitle">Управление арендами кассет</p>
          </div>
        </div>
        <AppButton @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Создать аренду
        </AppButton>
      </div>
      <div class="stats-row">
        <div class="stat-card stat-active">
          <div class="stat-icon">
            <Icon name="disc" :size="20" />
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ stats.active || 0 }}</p>
            <p class="stat-label">Активных</p>
          </div>
        </div>
        <div class="stat-card stat-completed">
          <div class="stat-icon">
            <Icon name="check" :size="20" />
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ stats.completed || 0 }}</p>
            <p class="stat-label">Завершенных</p>
          </div>
        </div>
        <div class="stat-card stat-overdue">
          <div class="stat-icon">
            <Icon name="alertCircle" :size="20" />
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ stats.overdue || 0 }}</p>
            <p class="stat-label">Просроченных</p>
          </div>
        </div>
      </div>
      <FilterBar
        :search-config="{ value: search, placeholder: 'Поиск по клиенту или фильму...' }"
        :filters="[{ key: 'status', value: filters.status, placeholder: 'Все статусы', options: statusOptions }]"
        @update:search="search = $event"
        @update:filter="updateFilter"
        @search="handleSearch"
      />
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="rentals"
          :actions="['view', 'delete']"
          @view="viewRental"
          @delete="deleteRental"
        />
      </div>
      <AppPagination
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        @change="handlePageChange"
      />
      <RentalModal
        v-model="showModal"
        :rental="selectedRental"
        @submit="handleSubmit"
      />
      <RentalDetailModal
        v-model="showDetailModal"
        :rental="selectedRental"
        @return="openReturnModal"
      />
      <ReturnModal
        v-model="showReturnModal"
        :rental="rentalToReturn"
        @return="handleReturnComplete"
      />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import AppButton from '@/components/common/AppButton.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import RentalModal from '@/components/rentals/RentalModal.vue'
import RentalDetailModal from '@/components/rentals/RentalDetailModal.vue'
import ReturnModal from '@/components/rentals/ReturnModal.vue'
import rentalsAPI from '@/api/rentals'
import notifications from '@/utils/notifications'
const statusOptions = [
  { value: 'active', label: 'Активные' },
  { value: 'returned', label: 'Завершенные' },
  { value: 'overdue', label: 'Просроченные' }
]
const columns = [
  { key: 'client.fullName', label: 'Клиент' },
  { key: 'cassette.movie.title', label: 'Фильм' },
  { key: 'rentalDate', label: 'Дата аренды', format: 'date' },
  { key: 'plannedReturnDate', label: 'Дата возврата', format: 'date' },
  { key: 'status', label: 'Статус', format: 'status' },
  { key: 'totalCost', label: 'Сумма', format: 'currency' }
]
const rentals = ref([])
const search = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const showReturnModal = ref(false)
const selectedRental = ref(null)
const rentalToReturn = ref(null)
const filters = reactive({
  status: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})
const stats = ref({
  active: 0,
  completed: 0,
  overdue: 0
})
const fetchRentals = async () => {
  try {
    const { data } = await rentalsAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search: search.value,
      status: filters.status
    })
    rentals.value = data.rentals
    Object.assign(pagination, data.pagination)
    if (data.stats) {
      stats.value = data.stats
    }
  } catch (error) {
    notifications.error('Ошибка загрузки аренд')
  }
}
const openCreateModal = () => {
  selectedRental.value = null
  showModal.value = true
}
const viewRental = (rental) => {
  selectedRental.value = rental
  showDetailModal.value = true
}
const deleteRental = async (rental) => {
  if (!confirm(`Удалить аренду?`)) return
  try {
    await rentalsAPI.delete(rental._id)
    notifications.success('Аренда удалена')
    fetchRentals()
  } catch (error) {
    notifications.error('Ошибка удаления аренды')
  }
}
const openReturnModal = (rental) => {
  rentalToReturn.value = rental
  showReturnModal.value = true
}
const handleReturnComplete = async () => {
  showReturnModal.value = false
  await fetchRentals()
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchRentals()
}
const handleSearch = () => {
  pagination.page = 1
  fetchRentals()
}
const updateFilter = (key, value) => {
  filters[key] = value
  pagination.page = 1
  fetchRentals()
}
const handlePageChange = (page) => {
  pagination.page = page
  fetchRentals()
}
onMounted(() => {
  fetchRentals()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-fast);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-active .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.stat-completed .stat-icon {
  background: rgba(100, 116, 139, 0.1);
  color: var(--secondary-color);
}
.stat-overdue .stat-icon {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-color);
}
.stat-content {
  flex: 1;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin: 0 0 4px 0;
}
.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}
</style>
