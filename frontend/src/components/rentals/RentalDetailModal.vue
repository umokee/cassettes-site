<template>
  <AppModal v-model="isOpen" title="Детали аренды" size="large">
    <div v-if="rental" class="rental-details">
      <div class="detail-section">
        <h3 class="section-title">Информация о клиенте</h3>
        <div class="detail-row">
          <span class="detail-label">ФИО:</span>
          <span class="detail-value">{{ rental.client?.fullName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Телефон:</span>
          <span class="detail-value">{{ rental.client?.phone }}</span>
        </div>
        <div v-if="rental.client?.email" class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ rental.client?.email }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Информация о кассете</h3>
        <div class="detail-row">
          <span class="detail-label">Фильм:</span>
          <span class="detail-value">{{ rental.cassette?.movie?.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Инвентарный номер:</span>
          <span class="detail-value">{{ rental.cassette?.inventoryNumber || rental.cassette?.serialNumber }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Формат:</span>
          <span class="detail-value">{{ rental.cassette?.format }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Детали аренды</h3>
        <div class="detail-row">
          <span class="detail-label">Дата аренды:</span>
          <span class="detail-value">{{ formatDate(rental.rentalDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Планируемая дата возврата:</span>
          <span class="detail-value">{{ formatDate(rental.plannedReturnDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Количество дней:</span>
          <span class="detail-value">{{ rental.days }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Цена за день:</span>
          <span class="detail-value">{{ formatCurrency(rental.pricePerDay) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Общая стоимость:</span>
          <span class="detail-value price">{{ formatCurrency(rental.totalCost) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="`status-${rental.status}`">
            {{ getStatusLabel(rental.status) }}
          </span>
        </div>
        <div v-if="rental.actualReturnDate" class="detail-row">
          <span class="detail-label">Фактическая дата возврата:</span>
          <span class="detail-value">{{ formatDateTime(rental.actualReturnDate) }}</span>
        </div>
      </div>
      <div v-if="rental.employee" class="detail-section">
        <h3 class="section-title">Сотрудник</h3>
        <div class="detail-row">
          <span class="detail-label">ФИО:</span>
          <span class="detail-value">{{ rental.employee?.fullName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Роль:</span>
          <span class="detail-value">{{ rental.employee?.role === 'admin' ? 'Администратор' : 'Кассир' }}</span>
        </div>
      </div>
      <div v-if="rental.tariff" class="detail-section">
        <h3 class="section-title">Тариф</h3>
        <div class="detail-row">
          <span class="detail-label">Название:</span>
          <span class="detail-value">{{ rental.tariff?.name }}</span>
        </div>
      </div>
      <div v-if="rental.conditionBefore || rental.conditionAfter" class="detail-section">
        <h3 class="section-title">Состояние кассеты</h3>
        <div v-if="rental.conditionBefore" class="detail-row">
          <span class="detail-label">До аренды:</span>
          <span class="detail-value">{{ getConditionLabel(rental.conditionBefore) }}</span>
        </div>
        <div v-if="rental.conditionAfter" class="detail-row">
          <span class="detail-label">После возврата:</span>
          <span class="detail-value">{{ getConditionLabel(rental.conditionAfter) }}</span>
        </div>
      </div>
      <div v-if="rental.notes" class="detail-section">
        <h3 class="section-title">Заметки</h3>
        <p class="rental-notes">{{ rental.notes }}</p>
      </div>
    </div>
    <template #footer>
      <div class="modal-footer-actions">
        <AppButton variant="outline" @click="close">Закрыть</AppButton>
        <AppButton
          v-if="rental?.status === 'active' || rental?.status === 'overdue'"
          variant="primary"
          @click="handleReturn"
        >
          <Icon name="check" :size="16" />
          Вернуть кассету
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
<script setup>
import { computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import Icon from '@/components/common/Icon.vue'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters'
const props = defineProps({
  modelValue: Boolean,
  rental: Object
})
const emit = defineEmits(['update:modelValue', 'return'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const getStatusLabel = (status) => {
  const labels = {
    active: 'Активная',
    returned: 'Возвращена',
    overdue: 'Просрочена',
    cancelled: 'Отменена'
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
const handleReturn = () => {
  emit('return', props.rental)
  close()
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.rental-details {
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
.detail-row:last-child {
  border-bottom: none;
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
.status-active {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}
.status-returned {
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
}
.status-overdue {
  color: var(--danger-color);
  font-weight: var(--font-semibold);
}
.status-cancelled {
  color: var(--text-muted);
  font-weight: var(--font-semibold);
}
.rental-notes {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}
.modal-footer-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}
</style>
