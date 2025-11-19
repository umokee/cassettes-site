<template>
  <AppLayout>
    <div class="tariffs-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="dollarSign" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Тарифы</h1>
            <p class="page-subtitle">Управление тарифными планами</p>
          </div>
        </div>
        <AppButton v-if="isAdmin" @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить тариф
        </AppButton>
      </div>
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="tariffs"
          :actions="isAdmin ? ['view', 'edit', 'delete'] : ['view']"
          @view="viewTariff"
          @edit="editTariff"
          @delete="deleteTariff"
        />
      </div>
      <TariffModal
        v-model="showModal"
        :tariff="selectedTariff"
        @submit="handleSubmit"
      />
      <TariffDetailModal
        v-model="showDetailModal"
        :tariff="selectedTariff"
      />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppTable from '@/components/common/AppTable.vue'
import TariffModal from '@/components/tariffs/TariffModal.vue'
import TariffDetailModal from '@/components/tariffs/TariffDetailModal.vue'
import tariffsAPI from '@/api/tariffs'
import { useAuthStore } from '@/store/modules/auth'
import notifications from '@/utils/notifications'
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const columns = [
  { key: 'name', label: 'Название' },
  { key: 'basePricePerDay', label: 'Цена/день', format: 'currency' },
  { key: 'overdueMultiplier', label: 'Множитель просрочки' },
  { key: 'isActive', label: 'Активен' },
  { key: 'isDefault', label: 'По умолчанию' }
]
const tariffs = ref([])
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedTariff = ref(null)
const fetchTariffs = async () => {
  try {
    const { data } = await tariffsAPI.getAll()
    tariffs.value = data.tariffs || data
  } catch (error) {
    notifications.error('Ошибка загрузки тарифов')
  }
}
const openCreateModal = () => {
  selectedTariff.value = null
  showModal.value = true
}
const viewTariff = (tariff) => {
  selectedTariff.value = tariff
  showDetailModal.value = true
}
const editTariff = (tariff) => {
  selectedTariff.value = tariff
  showModal.value = true
}
const deleteTariff = async (tariff) => {
  if (!confirm(`Удалить тариф "${tariff.name}"?`)) return
  try {
    await tariffsAPI.delete(tariff._id)
    notifications.success('Тариф удалён')
    fetchTariffs()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка удаления тарифа')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchTariffs()
}
onMounted(() => {
  fetchTariffs()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
