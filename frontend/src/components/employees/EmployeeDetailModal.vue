<template>
  <AppModal v-model="isOpen" title="Информация о сотруднике" size="medium">
    <div v-if="employee" class="employee-details">
      <div class="detail-section">
        <h3 class="section-title">Основная информация</h3>
        <div class="detail-row">
          <span class="detail-label">ФИО:</span>
          <span class="detail-value">{{ employee.fullName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Логин:</span>
          <span class="detail-value">{{ employee.login }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ employee.email || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Телефон:</span>
          <span class="detail-value">{{ employee.phone || '-' }}</span>
        </div>
        <div v-if="employee.birthDate" class="detail-row">
          <span class="detail-label">Дата рождения:</span>
          <span class="detail-value">{{ formatDate(employee.birthDate) }}</span>
        </div>
        <div v-if="employee.bio" class="detail-row">
          <span class="detail-label">О сотруднике:</span>
          <span class="detail-value">{{ employee.bio }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Роль и статус</h3>
        <div class="detail-row">
          <span class="detail-label">Роль:</span>
          <span class="detail-value">{{ getRoleLabel(employee.role) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="employee.isActive ? 'status-active' : 'status-inactive'">
            {{ employee.isActive ? 'Активен' : 'Неактивен' }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Дата найма:</span>
          <span class="detail-value">{{ formatDate(employee.hireDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Дата создания:</span>
          <span class="detail-value">{{ formatDate(employee.createdAt) }}</span>
        </div>
      </div>
      <div v-if="employee.stats" class="detail-section">
        <h3 class="section-title">Статистика</h3>
        <div class="detail-row">
          <span class="detail-label">Оформлено аренд:</span>
          <span class="detail-value">{{ employee.stats.totalRentalsProcessed || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Принято возвратов:</span>
          <span class="detail-value">{{ employee.stats.totalReturnsProcessed || 0 }}</span>
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
  employee: Object
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const getRoleLabel = (role) => {
  return role === 'admin' ? 'Администратор' : 'Кассир'
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.employee-details {
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
.status-inactive {
  color: var(--text-muted);
}
</style>
