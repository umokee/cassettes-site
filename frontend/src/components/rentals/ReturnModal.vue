<template>
  <AppModal v-model="isOpen" title="Возврат кассеты" size="large">
    <div v-if="rental" class="return-content">
      <div class="rental-summary">
        <h3>Информация об аренде</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Клиент</div>
            <div class="summary-value">{{ rental.client?.fullName }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Кассета</div>
            <div class="summary-value">{{ rental.cassette?.movie?.title }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Инв. №</div>
            <div class="summary-value">{{ rental.cassette?.inventoryNumber }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Дата аренды</div>
            <div class="summary-value">{{ formatDate(rental.rentalDate) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Планируемый возврат</div>
            <div class="summary-value">{{ formatDate(rental.plannedReturnDate) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Фактический возврат</div>
            <div class="summary-value">{{ formatDate(new Date()) }}</div>
          </div>
        </div>
        <div v-if="overdueDays > 0" class="overdue-warning">
          <Icon name="alertCircle" :size="20" />
          <div>
            <div class="warning-title">Просрочка!</div>
            <div class="warning-text">
              Кассета возвращена с опозданием на {{ overdueDays }}
              {{ getDaysWord(overdueDays) }}
            </div>
          </div>
        </div>
      </div>
      <div class="condition-section">
        <h3>Состояние кассеты</h3>
        <div class="condition-comparison">
          <div class="condition-before">
            <div class="condition-header">
              <Icon name="disc" :size="20" />
              <span>При выдаче</span>
            </div>
            <div class="condition-badge" :class="`condition-${rental.conditionBefore}`">
              {{ conditionLabel(rental.conditionBefore) }}
            </div>
          </div>
          <Icon name="chevronRight" :size="24" class="condition-arrow" />
          <div class="condition-after">
            <div class="condition-header">
              <Icon name="disc" :size="20" />
              <span>При возврате</span>
            </div>
            <div class="condition-select">
              <AppSelect
                v-model="form.condition"
                :options="conditionOptions"
                label="Выберите состояние"
                required
                @change="calculateFines"
              />
            </div>
          </div>
        </div>
        <div v-if="isDamaged" class="damage-warning">
          <Icon name="alertCircle" :size="20" />
          <span>Состояние кассеты ухудшилось - будет начислен штраф</span>
        </div>
      </div>
      <div class="notes-section">
        <label class="notes-label">
          <Icon name="edit" :size="16" />
          Примечания (необязательно)
        </label>
        <textarea
          v-model="form.notes"
          class="notes-textarea"
          placeholder="Дополнительная информация о состоянии кассеты или причине задержки..."
          rows="3"
        ></textarea>
      </div>
      <div class="cost-breakdown">
        <h3>Итоговый расчет</h3>
        <div class="cost-section">
          <div class="cost-row">
            <span>Стоимость аренды:</span>
            <span class="cost-value">{{ formatCurrency(rental.totalCost) }}</span>
          </div>
          <div v-if="calculatedFines.overdueFine > 0" class="cost-row fine">
            <span>
              <Icon name="clock" :size="16" />
              Штраф за просрочку ({{ overdueDays }} дней × {{ formatCurrency(rental.pricePerDay) }} × {{ rental.tariff?.overdueMultiplier || 2 }}):
            </span>
            <span class="cost-value">{{ formatCurrency(calculatedFines.overdueFine) }}</span>
          </div>
          <div v-if="calculatedFines.damageFine > 0" class="cost-row fine">
            <span>
              <Icon name="alertCircle" :size="16" />
              Штраф за повреждение
              ({{ conditionLabel(rental.conditionBefore) }} → {{ conditionLabel(form.condition) }}):
            </span>
            <span class="cost-value">{{ formatCurrency(calculatedFines.damageFine) }}</span>
          </div>
          <div v-if="totalFines > 0" class="cost-row subtotal">
            <span>Всего штрафов:</span>
            <span class="cost-value">{{ formatCurrency(totalFines) }}</span>
          </div>
          <div class="cost-row total">
            <span>Итого к оплате:</span>
            <span class="cost-value total-amount">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="modal-footer-actions">
        <AppButton variant="outline" @click="close">
          Отмена
        </AppButton>
        <AppButton
          variant="primary"
          :disabled="!form.condition || loading"
          @click="handleReturn"
        >
          {{ loading ? 'Обработка...' : 'Подтвердить возврат' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
<script setup>
import { ref, reactive, computed, watch } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import Icon from '@/components/common/Icon.vue'
import rentalsAPI from '@/api/rentals'
import notifications from '@/utils/notifications'
import { formatDate, formatCurrency } from '@/utils/formatters'
const props = defineProps({
  modelValue: Boolean,
  rental: Object
})
const emit = defineEmits(['update:modelValue', 'return'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = reactive({
  condition: '',
  notes: ''
})
const loading = ref(false)
const calculatedFines = ref({
  overdueFine: 0,
  damageFine: 0
})
const conditionOptions = [
  { value: 'excellent', label: 'Отличное' },
  { value: 'good', label: 'Хорошее' },
  { value: 'fair', label: 'Удовлетворительное' },
  { value: 'poor', label: 'Плохое' }
]
const overdueDays = computed(() => {
  if (!props.rental) return 0
  const now = new Date()
  const planned = new Date(props.rental.plannedReturnDate)
  if (now <= planned) return 0
  const diff = now - planned
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})
const isDamaged = computed(() => {
  if (!props.rental || !form.condition) return false
  const levels = ['excellent', 'good', 'fair', 'poor']
  const beforeIndex = levels.indexOf(props.rental.conditionBefore)
  const afterIndex = levels.indexOf(form.condition)
  return afterIndex > beforeIndex
})
const totalFines = computed(() => {
  return calculatedFines.value.overdueFine + calculatedFines.value.damageFine
})
const totalAmount = computed(() => {
  if (!props.rental) return 0
  return props.rental.totalCost + totalFines.value
})
const conditionLabel = (condition) => {
  const labels = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое'
  }
  return labels[condition] || condition
}
const getDaysWord = (days) => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня'
  return 'дней'
}
const calculateFines = () => {
  if (!props.rental || !form.condition) return
  let overdueFine = 0
  if (overdueDays.value > 0) {
    const multiplier = props.rental.tariff?.overdueMultiplier || 2
    overdueFine = Math.round(overdueDays.value * props.rental.pricePerDay * multiplier * 100) / 100
  }
  let damageFine = 0
  if (isDamaged.value) {
    const purchasePrice = props.rental.cassette?.purchasePrice || 0
    const multipliers = {
      excellent: 0,
      good: 0,
      fair: 0.5,
      poor: 1
    }
    const multiplier = multipliers[form.condition] || 0
    damageFine = Math.round(purchasePrice * multiplier * 100) / 100
  }
  calculatedFines.value = {
    overdueFine,
    damageFine
  }
}
const handleReturn = async () => {
  if (!form.condition) {
    notifications.error('Выберите состояние кассеты')
    return
  }
  loading.value = true
  try {
    await rentalsAPI.returnCassette(props.rental._id, {
      condition: form.condition,
      notes: form.notes
    })
    notifications.success('Кассета успешно возвращена')
    emit('return')
    close()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка при возврате кассеты')
  } finally {
    loading.value = false
  }
}
const close = () => {
  isOpen.value = false
  form.condition = ''
  form.notes = ''
  calculatedFines.value = {
    overdueFine: 0,
    damageFine: 0
  }
}
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.rental) {
    form.condition = props.rental.conditionBefore
    calculateFines()
  }
})
</script>
<style scoped>
.return-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.rental-summary h3,
.condition-section h3,
.cost-breakdown h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.summary-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.summary-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--text-sm);
}
.overdue-warning {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  color: var(--danger-color);
}
.warning-title {
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
}
.warning-text {
  font-size: var(--text-sm);
}
.condition-comparison {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}
.condition-before,
.condition-after {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.condition-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}
.condition-badge {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  text-align: center;
  font-size: var(--text-sm);
}
.condition-excellent {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}
.condition-good {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid #3b82f6;
}
.condition-fair {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}
.condition-poor {
  background: rgba(220, 38, 38, 0.2);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}
.condition-arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.damage-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--warning-color);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  color: var(--warning-color);
  font-size: var(--text-sm);
}
.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.notes-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}
.notes-textarea {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-sm);
  resize: vertical;
  transition: border-color var(--transition-fast);
}
.notes-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
.notes-textarea::placeholder {
  color: var(--text-muted);
}
.cost-breakdown {
  padding: var(--spacing-lg);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
}
.cost-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.cost-row span:first-child {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.cost-row.fine {
  color: var(--danger-color);
  font-weight: var(--font-medium);
}
.cost-row.subtotal {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.cost-row.total {
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-sm);
  border-top: 2px solid var(--primary-color);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
.cost-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
}
.total-amount {
  color: var(--primary-color);
  font-size: var(--text-2xl);
}
.modal-footer-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  width: 100%;
}
</style>
