<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Создание проката</h2>
          <button @click="close" class="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="steps-indicator">
            <div
              v-for="(step, index) in steps"
              :key="index"
              :class="['step', {
                active: currentStep === index,
                completed: currentStep > index,
                disabled: currentStep < index
              }]"
            >
              <div class="step-number">
                <svg v-if="currentStep > index" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>
          <div class="form-steps">
            <div v-show="currentStep === 0" class="form-step">
              <h3 class="step-title">Выберите клиента</h3>
              <div class="search-box">
                <input
                  v-model="clientSearch"
                  @input="searchClients"
                  type="text"
                  placeholder="Поиск по имени или телефону..."
                  class="form-input"
                />
              </div>
              <div v-if="loadingClients" class="loading">
                <div class="spinner"></div>
              </div>
              <div v-else-if="clients.length" class="items-grid">
                <div
                  v-for="client in clients"
                  :key="client._id"
                  @click="selectClient(client)"
                  :class="['item-card', { selected: selectedClient?._id === client._id }]"
                >
                  <div class="item-content">
                    <div class="item-title">{{ client.fullName }}</div>
                    <div class="item-subtitle">{{ formatPhone(client.phone) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty">Клиенты не найдены</div>
            </div>
            <div v-show="currentStep === 1" class="form-step">
              <h3 class="step-title">Выберите фильм</h3>
              <div class="search-row">
                <input
                  v-model="movieSearch"
                  @input="searchMovies"
                  type="text"
                  placeholder="Поиск фильма..."
                  class="form-input"
                />
                <select v-model="movieGenreFilter" @change="searchMovies" class="form-select">
                  <option value="">Все жанры</option>
                  <option v-for="genre in genres" :key="genre._id" :value="genre._id">
                    {{ genre.name }}
                  </option>
                </select>
              </div>
              <div v-if="loadingMovies" class="loading">
                <div class="spinner"></div>
              </div>
              <div v-else-if="movies.length" class="items-grid">
                <div
                  v-for="movie in movies"
                  :key="movie._id"
                  @click="selectMovie(movie)"
                  :class="['item-card', { selected: selectedMovie?._id === movie._id }]"
                >
                  <div class="item-content">
                    <div class="item-title">{{ movie.title }}</div>
                    <div class="item-subtitle">{{ movie.releaseYear }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty">Фильмы не найдены</div>
            </div>
            <div v-show="currentStep === 2" class="form-step">
              <h3 class="step-title">Выберите кассету</h3>
              <div v-if="loadingCassettes" class="loading">
                <div class="spinner"></div>
              </div>
              <div v-else-if="cassettes.length" class="items-grid">
                <div
                  v-for="cassette in cassettes"
                  :key="cassette._id"
                  @click="selectCassette(cassette)"
                  :class="['item-card', { selected: selectedCassette?._id === cassette._id }]"
                >
                  <div class="item-content">
                    <div class="item-title mono">{{ cassette.barcode }}</div>
                    <div class="item-subtitle">
                      <span :class="['badge', `badge-${cassette.condition}`]">
                        {{ getConditionLabel(cassette.condition) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty">Нет доступных кассет</div>
            </div>
            <div v-show="currentStep === 3" class="form-step">
              <h3 class="step-title">Выберите тариф</h3>
              <div v-if="loadingTariffs" class="loading">
                <div class="spinner"></div>
              </div>
              <div v-else-if="tariffs.length" class="items-grid">
                <div
                  v-for="tariff in tariffs"
                  :key="tariff._id"
                  @click="selectTariff(tariff)"
                  :class="['item-card tariff-card', { selected: selectedTariff?._id === tariff._id }]"
                >
                  <div class="item-content">
                    <div class="item-title">{{ tariff.name }}</div>
                    <div class="tariff-price">{{ formatCurrency(tariff.pricePerDay) }}/день</div>
                    <div class="item-subtitle">{{ tariff.durationDays }} дней</div>
                    <div v-if="tariff.durationDiscount" class="tariff-discount">
                      Скидка: {{ tariff.durationDiscount }}%
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty">Тарифы не найдены</div>
            </div>
            <div v-show="currentStep === 4" class="form-step">
              <h3 class="step-title">Подтверждение</h3>
              <div class="confirmation">
                <div class="confirm-item">
                  <span class="confirm-label">Клиент:</span>
                  <span class="confirm-value">{{ selectedClient?.fullName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">Фильм:</span>
                  <span class="confirm-value">{{ selectedMovie?.title }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">Кассета:</span>
                  <span class="confirm-value mono">{{ selectedCassette?.barcode }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">Тариф:</span>
                  <span class="confirm-value">{{ selectedTariff?.name }} ({{ selectedTariff?.durationDays }} дней)</span>
                </div>
                <div v-if="selectedTariff" class="price-card">
                  <div class="price-item">
                    <span class="price-label">Цена за день:</span>
                    <span class="price-value">{{ formatCurrency(selectedTariff.pricePerDay) }}</span>
                  </div>
                  <div v-if="selectedTariff.durationDiscount" class="price-item discount">
                    <span class="price-label">Скидка:</span>
                    <span class="price-value">{{ selectedTariff.durationDiscount }}%</span>
                  </div>
                  <div class="price-item total">
                    <span class="price-label">Итого:</span>
                    <span class="price-value">{{ formatCurrency(selectedTariff.pricePerDay * selectedTariff.durationDays) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="currentStep > 0"
            @click="prevStep"
            class="btn btn-secondary"
          >
            Назад
          </button>
          <div v-else></div>
          <button
            @click="nextStep"
            :disabled="!canProceed || creating"
            class="btn btn-primary"
          >
            {{ currentStep === 4 ? 'Создать прокат' : 'Далее' }}
            <div v-if="creating" class="spinner-small"></div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useClients } from '@/composables/useClients';
import { useMovies } from '@/composables/useMovies';
import { useCassettes } from '@/composables/useCassettes';
import { useTariffs } from '@/composables/useTariffs';
import { useGenres } from '@/composables/useGenres';
import { useRentals } from '@/composables/useRentals';
const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue', 'created']);
const { clients, loading: loadingClients, fetchClients } = useClients();
const { movies, loading: loadingMovies, fetchMovies } = useMovies();
const { cassettes, loading: loadingCassettes, fetchCassettes } = useCassettes();
const { tariffs, loading: loadingTariffs, fetchTariffs } = useTariffs();
const { genres, fetchGenres } = useGenres();
const { createRental } = useRentals();
const currentStep = ref(0);
const creating = ref(false);
const steps = [
  { label: 'Клиент' },
  { label: 'Фильм' },
  { label: 'Кассета' },
  { label: 'Тариф' },
  { label: 'Подтверждение' }
];
const selectedClient = ref(null);
const selectedMovie = ref(null);
const selectedCassette = ref(null);
const selectedTariff = ref(null);
const clientSearch = ref('');
const movieSearch = ref('');
const movieGenreFilter = ref('');
let searchTimeout = null;
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return !!selectedClient.value;
    case 1: return !!selectedMovie.value;
    case 2: return !!selectedCassette.value;
    case 3: return !!selectedTariff.value;
    case 4: return true;
    default: return false;
  }
});
const searchClients = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await fetchClients({ search: clientSearch.value, limit: 20 });
  }, 300);
};
const searchMovies = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const params = { search: movieSearch.value, limit: 20 };
    if (movieGenreFilter.value) params.genre = movieGenreFilter.value;
    await fetchMovies(params);
  }, 300);
};
const selectClient = (client) => {
  selectedClient.value = client;
};
const selectMovie = async (movie) => {
  selectedMovie.value = movie;
  selectedCassette.value = null;
};
const selectCassette = (cassette) => {
  selectedCassette.value = cassette;
};
const selectTariff = (tariff) => {
  selectedTariff.value = tariff;
};
const nextStep = async () => {
  if (!canProceed.value) return;
  if (currentStep.value === 4) {
    await createNewRental();
    return;
  }
  currentStep.value++;
  if (currentStep.value === 2 && selectedMovie.value) {
    await fetchCassettes({
      movie: selectedMovie.value._id,
      status: 'available'
    });
  }
};
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};
const createNewRental = async () => {
  creating.value = true;
  try {
    const rentalData = {
      client: selectedClient.value._id,
      cassette: selectedCassette.value._id,
      tariff: selectedTariff.value._id
    };
    const rental = await createRental(rentalData);
    emit('created', rental);
    close();
  } catch (error) {
    console.error('Ошибка создания проката:', error);
  } finally {
    creating.value = false;
  }
};
const close = () => {
  emit('update:modelValue', false);
  setTimeout(() => {
    currentStep.value = 0;
    selectedClient.value = null;
    selectedMovie.value = null;
    selectedCassette.value = null;
    selectedTariff.value = null;
    clientSearch.value = '';
    movieSearch.value = '';
    movieGenreFilter.value = '';
  }, 300);
};
const getConditionLabel = (condition) => {
  const labels = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовл.',
    poor: 'Плохое'
  };
  return labels[condition] || condition;
};
const formatCurrency = (amount) => {
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
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchClients({ limit: 20 });
    fetchGenres();
    fetchTariffs();
  }
});
</script>
<style scoped>



.steps-indicator {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  transition: all var(--transition-normal);
}

.step.active .step-number {
  background: var(--primary-color);
  color: #ffffff;
}

.step.completed .step-number {
  background: var(--success-color);
  color: #ffffff;
}

.step-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.step.active .step-label {
  color: var(--primary-color);
}


.form-steps {
  min-height: 400px;
}

.form-step {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}


.search-box {
  margin-bottom: var(--spacing-2xl);
}

.search-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.search-row .form-input {
  flex: 1;
}


.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.item-card:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.item-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-glow);
  box-shadow: var(--shadow-primary);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.item-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tariff-card .item-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tariff-price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
}

.tariff-discount {
  font-size: var(--text-sm);
  color: var(--success-color);
  font-weight: var(--font-semibold);
}


.confirmation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.confirm-item.highlight {
  background: var(--primary-glow);
  border: 1px solid var(--primary-color);
}

.confirm-label {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.confirm-value {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

.confirm-item.highlight .confirm-value {
  color: var(--primary-color);
  font-size: var(--text-lg);
}


.price-card {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.price-item:last-child {
  border-bottom: none;
}

.price-item.discount .price-value {
  color: var(--success-color);
}

.price-item.total {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--border-color);
}

.price-item.total .price-label {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
}

.price-item.total .price-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
}

.price-label {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.price-value {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}


.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: var(--spacing-sm);
}
</style>
