<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Детали проката #{{ rental?._id?.slice(-6) }}</h2>
          <button class="modal-close" @click="close" aria-label="Закрыть окно">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body" v-if="loading">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>
        <div class="modal-body" v-else-if="error">
          <p class="error-message">{{ error }}</p>
          <button class="btn btn-secondary" @click="fetchRental">Попробовать снова</button>
        </div>
        <div class="modal-body" v-else>
          <section class="section">
            <h3>Клиент</h3>
            <p><strong>Имя:</strong> {{ rental.client.fullName }}</p>
            <p><strong>Телефон:</strong> {{ formatPhone(rental.client.phone) }}</p>
            <p><strong>Email:</strong> {{ rental.client.email || 'Не указан' }}</p>
          </section>
          <section class="section">
            <h3>Фильм</h3>
            <p><strong>Название:</strong> {{ rental.cassette.movie.title }}</p>
            <p><strong>Год:</strong> {{ rental.cassette.movie.releaseYear }}</p>
            <p><strong>Жанры:</strong> {{ rental.cassette.movie.genres.map(g => g.name).join(', ') }}</p>
          </section>
          <section class="section">
            <h3>Кассета</h3>
            <p><strong>Штрихкод:</strong> {{ rental.cassette.barcode }}</p>
            <p><strong>Состояние:</strong> {{ getConditionLabel(rental.conditionBefore) }}</p>
            <p><strong>Описание:</strong> {{ rental.cassette.description || 'Нет' }}</p>
          </section>
          <section class="section">
            <h3>Тариф</h3>
            <p><strong>Название:</strong> {{ rental.tariff.name }}</p>
            <p><strong>Длительность:</strong> {{ rental.tariff.durationDays }} дней</p>
            <p><strong>Цена за день:</strong> {{ formatCurrency(rental.tariff.pricePerDay) }}</p>
          </section>
          <section class="section">
            <h3>Даты и платежи</h3>
            <p><strong>Дата проката:</strong> {{ formatDate(rental.rentDate) }}</p>
            <p><strong>Срок возврата:</strong> {{ formatDate(rental.dueDate) }}</p>
            <p><strong>Статус:</strong> <span :class="['badge', `badge-${rental.status}`]">{{ getStatusLabel(rental.status) }}</span></p>
            <p><strong>Общая стоимость:</strong> {{ formatCurrency(rental.totalCost) }}</p>
            <p v-if="rental.fines?.length">
              <strong>Штрафы:</strong> {{ formatCurrency(calculateTotalFines(rental.fines)) }}
            </p>
          </section>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref, watch } from 'vue';
import { useRentals } from '@/composables/useRentals';
const props = defineProps({
  modelValue: Boolean,
  rentalId: String
});
const emit = defineEmits(['update:modelValue']);
const { rental, loading, error, fetchRental } = useRentals();
watch(() => props.modelValue, val => {
  if (val && props.rentalId) {
    fetchRental(props.rentalId);
  }
});
const close = () => {
  emit('update:modelValue', false);
};
const getConditionLabel = (condition) => {
  const map = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое'
  };
  return map[condition] || condition;
};
const getStatusLabel = (status) => {
  const map = {
    active: 'Активный',
    returned: 'Возвращен',
    overdue: 'Просрочен'
  };
  return map[status] || status;
};
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};
const formatCurrency = (amount) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};
const formatPhone = (phone) => {
  if (!phone) return 'Не указан';
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
};
const calculateTotalFines = (fines) => {
  return fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0;
};
</script>
<style scoped>

.section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.section h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-accent);
  font-size: var(--text-lg);
}

.section p {
  margin: var(--spacing-xs) 0;
  font-size: var(--text-sm);
}

.section p strong {
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  display: inline-block;
  min-width: 140px;
}
</style>
