<template>
  <AppLayout>
    <div class="clients-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="users" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Клиенты</h1>
            <p class="page-subtitle">Управление базой клиентов</p>
          </div>
        </div>
        <AppButton @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить клиента
        </AppButton>
      </div>
      <FilterBar
        :search-config="{ value: search, placeholder: 'Поиск по имени, телефону или email...' }"
        @update:search="search = $event"
        @search="handleSearch"
      />
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="clients"
          :actions="['view', 'edit', 'toggle']"
          @view="viewClient"
          @edit="editClient"
          @toggle="toggleClientStatus"
        />
      </div>
      <AppPagination
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        @change="handlePageChange"
      />
      <ClientModal
        v-model="showModal"
        :client="selectedClient"
        @submit="handleSubmit"
      />
      <ClientDetailModal
        v-model="showDetailModal"
        :client="selectedClient"
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
import ClientModal from '@/components/clients/ClientModal.vue'
import ClientDetailModal from '@/components/clients/ClientDetailModal.vue'
import clientsAPI from '@/api/clients'
import notifications from '@/utils/notifications'
const columns = [
  { key: 'fullName', label: 'ФИО' },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Статус', format: 'status' },
  { key: 'totalRentals', label: 'Аренды' }
]
const clients = ref([])
const search = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedClient = ref(null)
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})
const fetchClients = async () => {
  try {
    const { data } = await clientsAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search: search.value
    })
    clients.value = data.clients
    Object.assign(pagination, data.pagination)
  } catch (error) {
    notifications.error('Ошибка загрузки клиентов')
  }
}
const handleSearch = () => {
  pagination.page = 1
  fetchClients()
}
const openCreateModal = () => {
  selectedClient.value = null
  showModal.value = true
}
const viewClient = (client) => {
  selectedClient.value = client
  showDetailModal.value = true
}
const editClient = (client) => {
  selectedClient.value = client
  showModal.value = true
}
const toggleClientStatus = async (client) => {
  const newStatus = client.status === 'active' ? 'blocked' : 'active'
  const action = newStatus === 'blocked' ? 'заблокировать' : 'активировать'
  if (!confirm(`Вы действительно хотите ${action} клиента ${client.fullName}?`)) return
  try {
    await clientsAPI.update(client._id, { status: newStatus })
    notifications.success(`Клиент ${newStatus === 'blocked' ? 'заблокирован' : 'активирован'}`)
    fetchClients()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка изменения статуса клиента')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchClients()
}
const handlePageChange = (page) => {
  pagination.page = page
  fetchClients()
}
onMounted(() => {
  fetchClients()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
