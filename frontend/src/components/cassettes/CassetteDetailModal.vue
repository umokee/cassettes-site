<template>
  <AppModal v-model="isOpen" title="Информация о кассете" size="medium">
    <div v-if="cassette" class="cassette-details">
      <div class="detail-section">
        <h3 class="section-title">Основная информация</h3>
        <div class="detail-row">
          <span class="detail-label">Инвентарный номер:</span>
          <span class="detail-value">{{ cassette.inventoryNumber || cassette.serialNumber }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Фильм:</span>
          <span class="detail-value">{{ cassette.movie?.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Формат:</span>
          <span class="detail-value">{{ cassette.format }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Состояние:</span>
          <span class="detail-value">{{ getConditionLabel(cassette.condition) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="`status-${cassette.status}`">
            {{ getStatusLabel(cassette.status) }}
          </span>
        </div>
        <div v-if="cassette.notes" class="detail-row">
          <span class="detail-label">Заметки:</span>
          <span class="detail-value">{{ cassette.notes }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Финансы и покупка</h3>
        <div class="detail-row">
          <span class="detail-label">Цена покупки:</span>
          <span class="detail-value price">{{ formatCurrency(cassette.purchasePrice) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Дата покупки:</span>
          <span class="detail-value">{{ formatDate(cassette.purchaseDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Добавлена в систему:</span>
          <span class="detail-value">{{ formatDate(cassette.createdAt) }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Статистика</h3>
        <div class="detail-row">
          <span class="detail-label">Всего аренд:</span>
          <span class="detail-value">{{ cassette.rentalCount || 0 }}</span>
        </div>
        <div v-if="cassette.lastRentalDate" class="detail-row">
          <span class="detail-label">Последняя аренда:</span>
          <span class="detail-value">{{ formatDate(cassette.lastRentalDate) }}</span>
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
import { formatDate, formatCurrency } from '@/utils/formatters'
const props = defineProps({
  modelValue: Boolean,
  cassette: Object
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const getStatusLabel = (status) => {
  const labels = {
    available: 'Доступна',
    rented: 'Арендована',
    damaged: 'Повреждена',
    lost: 'Утеряна'
  }
  return labels[status] || status
}
const getConditionLabel = (condition) => {
  const labels = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое'
  }
  return labels[condition] || condition
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.cassette-details {
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
.detail-value.price {
  color: var(--primary-color);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}
.status-available {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}
.status-rented {
  color: var(--primary-color);
  font-weight: var(--font-semibold);
}
.status-damaged {
  color: var(--warning-color);
  font-weight: var(--font-semibold);
}
.status-lost {
  color: var(--danger-color);
  font-weight: var(--font-semibold);
}
</style>
