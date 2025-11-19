<template>
  <AppLayout>
    <div class="employees-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="briefcase" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Сотрудники</h1>
            <p class="page-subtitle">Управление персоналом</p>
          </div>
        </div>
        <AppButton @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить сотрудника
        </AppButton>
      </div>
      <FilterBar
        :search-config="{ value: search, placeholder: 'Поиск по имени или email...' }"
        :filters="[{ key: 'role', value: filters.role, placeholder: 'Все роли', options: roleOptions }]"
        @update:search="search = $event"
        @update:filter="updateFilter"
        @search="handleSearch"
      />
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="employees"
          :actions="['view', 'edit', 'toggle']"
          @view="viewEmployee"
          @edit="editEmployee"
          @toggle="toggleEmployeeStatus"
        />
      </div>
      <AppPagination
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        @change="handlePageChange"
      />
      <EmployeeModal
        v-model="showModal"
        :employee="selectedEmployee"
        @submit="handleSubmit"
      />
      <EmployeeDetailModal
        v-model="showDetailModal"
        :employee="selectedEmployee"
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
import EmployeeModal from '@/components/employees/EmployeeModal.vue'
import EmployeeDetailModal from '@/components/employees/EmployeeDetailModal.vue'
import employeesAPI from '@/api/employees'
import notifications from '@/utils/notifications'
const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'cashier', label: 'Кассир' }
]
const columns = [
  { key: 'fullName', label: 'ФИО' },
  { key: 'login', label: 'Логин' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Роль' },
  { key: 'isActive', label: 'Активен' }
]
const employees = ref([])
const search = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedEmployee = ref(null)
const filters = reactive({
  role: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})
const fetchEmployees = async () => {
  try {
    const { data } = await employeesAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search: search.value,
      role: filters.role
    })
    employees.value = data.employees
    Object.assign(pagination, data.pagination)
  } catch (error) {
    notifications.error('Ошибка загрузки сотрудников')
  }
}
const openCreateModal = () => {
  selectedEmployee.value = null
  showModal.value = true
}
const viewEmployee = (employee) => {
  selectedEmployee.value = employee
  showDetailModal.value = true
}
const editEmployee = (employee) => {
  selectedEmployee.value = employee
  showModal.value = true
}
const toggleEmployeeStatus = async (employee) => {
  const newStatus = !employee.isActive
  const action = newStatus ? 'активировать' : 'деактивировать'
  if (!confirm(`Вы действительно хотите ${action} сотрудника ${employee.fullName}?`)) return
  try {
    await employeesAPI.update(employee._id, { isActive: newStatus })
    notifications.success(`Сотрудник ${newStatus ? 'активирован' : 'деактивирован'}`)
    fetchEmployees()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка изменения статуса сотрудника')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchEmployees()
}
const handleSearch = () => {
  pagination.page = 1
  fetchEmployees()
}
const updateFilter = (key, value) => {
  filters[key] = value
  pagination.page = 1
  fetchEmployees()
}
const handlePageChange = (page) => {
  pagination.page = page
  fetchEmployees()
}
onMounted(() => {
  fetchEmployees()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
