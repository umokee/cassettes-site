<template>
  <AppModal v-model="isOpen" title="Информация о тарифе" size="medium">
    <div v-if="tariff" class="tariff-details">
      <div class="detail-section">
        <h3 class="section-title">Основная информация</h3>
        <div class="detail-row">
          <span class="detail-label">Название:</span>
          <span class="detail-value">{{ tariff.name }}</span>
        </div>
        <div v-if="tariff.description" class="detail-row">
          <span class="detail-label">Описание:</span>
          <span class="detail-value">{{ tariff.description }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Цена за день:</span>
          <span class="detail-value price">{{ formatCurrency(tariff.basePricePerDay) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="tariff.isActive ? 'status-active' : 'status-inactive'">
            {{ tariff.isActive ? 'Активен' : 'Неактивен' }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">По умолчанию:</span>
          <span class="detail-value">{{ tariff.isDefault ? 'Да' : 'Нет' }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3 class="section-title">Штрафы и доплаты</h3>
        <div class="detail-row">
          <span class="detail-label">Множитель просрочки:</span>
          <span class="detail-value">×{{ tariff.overdueMultiplier || 2 }}</span>
        </div>
        <div v-if="tariff.damageMultipliers" class="damage-multipliers">
          <span class="detail-label">Штрафы за повреждения:</span>
          <div class="multipliers-grid">
            <div class="multiplier-item">
              <span class="multiplier-label">Отлично → Хорошее:</span>
              <span class="multiplier-value">{{ tariff.damageMultipliers.excellent || 0 }}×</span>
            </div>
            <div class="multiplier-item">
              <span class="multiplier-label">Хорошее → Удовл.:</span>
              <span class="multiplier-value">{{ tariff.damageMultipliers.good || 0 }}×</span>
            </div>
            <div class="multiplier-item">
              <span class="multiplier-label">Удовл. → Плохое:</span>
              <span class="multiplier-value">{{ tariff.damageMultipliers.fair || 0.5 }}×</span>
            </div>
            <div class="multiplier-item">
              <span class="multiplier-label">Плохое состояние:</span>
              <span class="multiplier-value">{{ tariff.damageMultipliers.poor || 1 }}×</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="tariff.durationDiscounts && tariff.durationDiscounts.length > 0" class="detail-section">
        <h3 class="section-title">Скидки по длительности</h3>
        <div class="discounts-list">
          <div
            v-for="(discount, idx) in tariff.durationDiscounts"
            :key="idx"
            class="discount-card"
          >
            <div class="discount-days">От {{ discount.minDays }} дней</div>
            <div class="discount-percent">{{ discount.discount }}% скидка</div>
          </div>
        </div>
      </div>
      <div v-if="tariff.allowedGenres && tariff.allowedGenres.length > 0" class="detail-section">
        <h3 class="section-title">Доступные жанры</h3>
        <div class="genres-list">
          <span
            v-for="genre in tariff.allowedGenres"
            :key="genre._id || genre"
            class="genre-tag"
          >
            {{ genre.name || genre }}
          </span>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Создан:</span>
          <span class="detail-value">{{ formatDate(tariff.createdAt) }}</span>
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
  tariff: Object
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.tariff-details {
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
.status-active {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}
.status-inactive {
  color: var(--text-muted);
}

.damage-multipliers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.multipliers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}
.multiplier-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
}
.multiplier-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.multiplier-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.discounts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}
.discount-card {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border: 2px solid var(--success-color);
  border-radius: var(--radius-md);
  text-align: center;
}
.discount-days {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}
.discount-percent {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--success-color);
}

.genres-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
.genre-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}
.genre-tag:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}
</style>
