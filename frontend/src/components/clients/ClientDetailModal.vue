<template>
  <AppModal v-model="isOpen" title="Информация о клиенте" size="medium">
    <div v-if="client" class="client-details">
      <div class="detail-section">
        <h3 class="section-title">Контактные данные</h3>
        <div class="detail-row">
          <span class="detail-label">ФИО:</span>
          <span class="detail-value">{{ client.fullName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Телефон:</span>
          <span class="detail-value">{{ client.phone }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ client.email || '-' }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Статус</h3>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="`status-${client.status}`">
            {{ getStatusLabel(client.status) }}
          </span>
        </div>
        <div v-if="client.notes" class="detail-row">
          <span class="detail-label">Заметки:</span>
          <span class="detail-value">{{ client.notes }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Статистика аренд</h3>
        <div class="detail-row">
          <span class="detail-label">Всего аренд:</span>
          <span class="detail-value">{{ client.totalRentals || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Активных аренд:</span>
          <span class="detail-value">{{ client.activeRentals || 0 }}</span>
        </div>
        <div v-if="client.lastRentalDate" class="detail-row">
          <span class="detail-label">Последняя аренда:</span>
          <span class="detail-value">{{ formatDate(client.lastRentalDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Дата регистрации:</span>
          <span class="detail-value">{{ formatDate(client.registrationDate || client.createdAt) }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <AppButton variant="outline" @click="close">Закрыть</AppButton>
    </template>
  </AppModal>
</template>
<script setup>
import { computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate } from '@/utils/formatters'
const props = defineProps({
  modelValue: Boolean,
  client: Object
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const getStatusLabel = (status) => {
  const labels = {
    active: 'Активен',
    blocked: 'Заблокирован',
    pending: 'Ожидает'
  }
  return labels[status] || status
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.client-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--primary-color);
  margin: 0 0 var(--spacing-sm) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}
.detail-label {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
.detail-value {
  color: var(--text-primary);
  font-size: var(--text-base);
}
.status-active {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}
.status-blocked {
  color: var(--danger-color);
  font-weight: var(--font-semibold);
}
.status-pending {
  color: var(--warning-color);
  font-weight: var(--font-semibold);
}
</style>
