<template>
  <div>
    <AppModal v-model="isOpen" :title="`Новая аренда - Шаг ${currentStep} из 4`" size="large">
    <div class="step-progress">
      <div
        v-for="step in 4"
        :key="step"
        class="step-item"
        :class="{ active: step === currentStep, completed: step < currentStep }"
      >
        <div class="step-number">{{ step }}</div>
        <div class="step-label">{{ getStepLabel(step) }}</div>
      </div>
    </div>
    <form @submit.prevent="handleNext">
      <div v-if="currentStep === 1" class="step-content">
        <AppSearch
          v-model="clientSearch"
          placeholder="Поиск клиента по имени или телефону..."
        />
        <div class="selection-list">
          <div
            v-for="client in filteredClients"
            :key="client._id"
            class="selection-item"
            :class="{ selected: form.client === client._id }"
            @click="selectClient(client)"
          >
            <div class="item-main">
              <Icon name="user" :size="20" />
              <div>
                <div class="item-title">{{ client.fullName }}</div>
                <div class="item-subtitle">{{ client.phone }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentStep === 2" class="step-content">
        <div v-if="!selectedMovie">
          <h3>Выберите фильм</h3>
          <AppSearch
            v-model="movieSearch"
            placeholder="Поиск фильма по названию..."
          />
          <div class="selection-list">
            <div
              v-for="movie in filteredMovies"
              :key="movie._id"
              class="movie-card"
              @click="selectMovie(movie)"
            >
              <div class="item-main">
                <Icon name="film" :size="20" />
                <div>
                  <div class="item-title">{{ movie.title }}</div>
                  <div class="item-subtitle">
                    {{ movie.availableCassettes }} {{ movie.availableCassettes === 1 ? 'доступная кассета' : 'доступных кассет' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="cassette-header">
            <h3>Выберите кассету</h3>
            <AppButton variant="outline" size="small" @click="backToMovieSelection">
              Назад к выбору фильма
            </AppButton>
          </div>
          <AppSearch
            v-model="cassetteSearch"
            placeholder="Поиск по инвентарному номеру..."
          />
          <div class="selection-list">
            <div
              v-for="cassette in filteredCassettes"
              :key="cassette._id"
              class="selection-item cassette-item"
              :class="{ selected: form.cassette === cassette._id }"
              @click="selectCassette(cassette)"
            >
              <div class="item-main">
                <Icon name="disc" :size="20" />
                <div class="cassette-details">
                  <div class="item-title">Инв. № {{ cassette.inventoryNumber }}</div>
                  <div class="cassette-info">
                    <span class="info-item">
                      <Icon name="star" :size="14" />
                      {{ conditionLabel(cassette.condition) }}
                    </span>
                    <span class="info-item">
                      <Icon name="disc" :size="14" />
                      {{ cassette.format || 'VHS' }}
                    </span>
                    <span v-if="cassette.rentalCount" class="info-item">
                      <Icon name="users" :size="14" />
                      {{ cassette.rentalCount }} аренд
                    </span>
                    <span v-if="cassette.lastRentalDate" class="info-item">
                      <Icon name="calendar" :size="14" />
                      Последняя: {{ formatDate(new Date(cassette.lastRentalDate)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentStep === 3" class="step-content">
        <h3>Выберите тариф</h3>
        <div v-if="filteredTariffs.length === 0" class="empty-state">
          <p>Нет доступных тарифов для выбранного фильма. Пожалуйста, создайте тариф с подходящими жанрами.</p>
        </div>
        <div v-else class="tariff-list">
          <div
            v-for="tariff in filteredTariffs"
            :key="tariff._id"
            class="tariff-card"
            :class="{ selected: form.tariff === tariff._id }"
          >
            <div class="tariff-card-content" @click="selectTariff(tariff)">
              <div class="tariff-header">
                <div class="tariff-name">{{ tariff.name }}</div>
                <div class="tariff-price">{{ tariff.basePricePerDay }} ₽/день</div>
              </div>
              <div v-if="tariff.description" class="tariff-description">
                {{ tariff.description }}
              </div>
              <div v-if="tariff.durationDiscounts && tariff.durationDiscounts.length > 0" class="tariff-discounts">
                <div class="discounts-title">
                  <Icon name="percent" :size="14" />
                  Скидки по длительности:
                </div>
                <div v-for="(discount, idx) in tariff.durationDiscounts" :key="idx" class="discount-item">
                  <Icon name="check" :size="12" />
                  от {{ discount.minDays }} дн. — <strong>{{ discount.discount }}% скидка</strong>
                </div>
              </div>
            </div>
            <div class="tariff-actions">
              <button
                type="button"
                class="tariff-details-btn"
                @click.stop="showTariffDetails(tariff)"
              >
                <Icon name="info" :size="14" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
        <div class="duration-input">
          <AppInput
            v-model.number="form.days"
            label="Количество дней аренды"
            type="number"
            min="1"
            required
            @input="calculateCost"
          />
        </div>
        <div v-if="costCalculation" class="cost-preview">
          <div class="cost-preview-header">
            <Icon name="dollarSign" :size="18" />
            <h4>Расчет стоимости</h4>
          </div>
          <div class="cost-details">
            <div class="cost-row">
              <span>Цена за день:</span>
              <span class="cost-value">{{ costCalculation.pricePerDay }} ₽</span>
            </div>
            <div class="cost-row">
              <span>Количество дней:</span>
              <span class="cost-value">{{ form.days }}</span>
            </div>
            <div class="cost-row subtotal">
              <span>Сумма без скидки:</span>
              <span class="cost-value">{{ (costCalculation.pricePerDay * form.days).toFixed(2) }} ₽</span>
            </div>
            <div v-if="costCalculation.discount > 0" class="cost-row discount-applied">
              <span class="discount-label">
                <Icon name="percent" :size="16" />
                Скидка за длительность {{ costCalculation.discount }}%:
              </span>
              <span class="discount-value">-{{ ((costCalculation.pricePerDay * form.days) * (costCalculation.discount / 100)).toFixed(2) }} ₽</span>
            </div>
            <div class="cost-row total">
              <span>Итого к оплате:</span>
              <span class="cost-value-total">{{ costCalculation.totalCost }} ₽</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentStep === 4" class="step-content">
        <h3>Проверьте данные</h3>
        <div class="review-section">
          <div class="review-item">
            <div class="review-label">Клиент</div>
            <div class="review-value">{{ selectedClientName }}</div>
          </div>
          <div class="review-item">
            <div class="review-label">Кассета</div>
            <div class="review-value">{{ selectedCassetteName }}</div>
          </div>
          <div class="review-item">
            <div class="review-label">Тариф</div>
            <div class="review-value">{{ selectedTariffName }}</div>
          </div>
          <div class="review-item">
            <div class="review-label">Период аренды</div>
            <div class="review-value">{{ form.days }} дней</div>
          </div>
          <div class="review-item">
            <div class="review-label">Дата начала</div>
            <div class="review-value">{{ formatDate(new Date()) }}</div>
          </div>
          <div class="review-item">
            <div class="review-label">Планируемая дата возврата</div>
            <div class="review-value">{{ formatDate(plannedReturnDate) }}</div>
          </div>
        </div>
        <div v-if="costCalculation" class="cost-preview">
          <div class="cost-preview-header">
            <Icon name="dollarSign" :size="18" />
            <h4>Расчет стоимости</h4>
          </div>
          <div class="cost-details">
            <div class="cost-row">
              <span>Цена за день:</span>
              <span class="cost-value">{{ costCalculation.pricePerDay }} ₽</span>
            </div>
            <div class="cost-row">
              <span>Количество дней:</span>
              <span class="cost-value">{{ form.days }}</span>
            </div>
            <div class="cost-row subtotal">
              <span>Сумма без скидки:</span>
              <span class="cost-value">{{ (costCalculation.pricePerDay * form.days).toFixed(2) }} ₽</span>
            </div>
            <div v-if="costCalculation.discount > 0" class="cost-row discount-applied">
              <span class="discount-label">
                <Icon name="percent" :size="16" />
                Скидка за длительность {{ costCalculation.discount }}%:
              </span>
              <span class="discount-value">-{{ ((costCalculation.pricePerDay * form.days) * (costCalculation.discount / 100)).toFixed(2) }} ₽</span>
            </div>
            <div class="cost-row total">
              <span>Итого к оплате:</span>
              <span class="cost-value-total">{{ costCalculation.totalCost }} ₽</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <AppButton type="button" variant="outline" @click="handleBack">
          {{ currentStep === 1 ? 'Отмена' : 'Назад' }}
        </AppButton>
        <AppButton type="submit" :disabled="!canProceed || loading">
          {{ currentStep === 4 ? (loading ? 'Создание...' : 'Создать аренду') : 'Далее' }}
        </AppButton>
      </div>
    </form>
    </AppModal>
    <TariffDetailModal
      v-model="showTariffDetailModal"
      :tariff="selectedTariffForDetails"
    />
  </div>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import Icon from '@/components/common/Icon.vue'
import TariffDetailModal from '@/components/tariffs/TariffDetailModal.vue'
import rentalsAPI from '@/api/rentals'
import clientsAPI from '@/api/clients'
import cassettesAPI from '@/api/cassettes'
import tariffsAPI from '@/api/tariffs'
import moviesAPI from '@/api/movies'
import notifications from '@/utils/notifications'
import { formatDate } from '@/utils/formatters'
const props = defineProps({
  modelValue: Boolean,
  rental: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const currentStep = ref(1)
const clientSearch = ref('')
const cassetteSearch = ref('')
const movieSearch = ref('')
const form = reactive({
  client: '',
  cassette: '',
  tariff: '',
  days: 3
})
const loading = ref(false)
const clients = ref([])
const cassettes = ref([])
const tariffs = ref([])
const movies = ref([])
const selectedMovie = ref(null)
const costCalculation = ref(null)
const showTariffDetailModal = ref(false)
const selectedTariffForDetails = ref(null)
const filteredClients = computed(() => {
  if (!clientSearch.value) return clients.value
  const search = clientSearch.value.toLowerCase()
  return clients.value.filter(c =>
    c.fullName.toLowerCase().includes(search) ||
    c.phone.includes(search)
  )
})
const filteredMovies = computed(() => {
  if (!movieSearch.value) return movies.value
  const search = movieSearch.value.toLowerCase()
  return movies.value.filter(m =>
    m.title.toLowerCase().includes(search)
  )
})
const movieCassettes = computed(() => {
  if (!selectedMovie.value) return []
  return cassettes.value.filter(c => c.movie._id === selectedMovie.value)
})
const filteredCassettes = computed(() => {
  if (!cassetteSearch.value) return movieCassettes.value
  const search = cassetteSearch.value.toLowerCase()
  return movieCassettes.value.filter(c =>
    c.inventoryNumber.includes(search)
  )
})
const filteredTariffs = computed(() => {
  if (!form.cassette) return tariffs.value
  const selectedCassette = cassettes.value.find(c => c._id === form.cassette)
  if (!selectedCassette || !selectedCassette.movie) return tariffs.value
  const movieGenres = selectedCassette.movie.genres || []
  const movieGenreIds = movieGenres.map(g => g._id || g)
  return tariffs.value.filter(tariff => {
    if (!tariff.allowedGenres || tariff.allowedGenres.length === 0) {
      return true
    }
    const allowedGenreIds = tariff.allowedGenres.map(g => g._id || g)
    return movieGenreIds.some(genreId => allowedGenreIds.includes(genreId))
  })
})
const selectedClientName = computed(() => {
  const client = clients.value.find(c => c._id === form.client)
  return client ? `${client.fullName} (${client.phone})` : ''
})
const selectedCassetteName = computed(() => {
  const cassette = cassettes.value.find(c => c._id === form.cassette)
  return cassette ? `${cassette.movie.title} - Инв. № ${cassette.inventoryNumber}` : ''
})
const selectedTariffName = computed(() => {
  const tariff = tariffs.value.find(t => t._id === form.tariff)
  return tariff ? tariff.name : ''
})
const plannedReturnDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + form.days)
  return date
})
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!form.client
    case 2:
      return !!form.cassette
    case 3:
      return !!form.tariff && form.days > 0
    case 4:
      return !!form.client && !!form.cassette && !!form.tariff && form.days > 0
    default:
      return false
  }
})
const getStepLabel = (step) => {
  const labels = {
    1: 'Клиент',
    2: selectedMovie.value ? 'Кассета' : 'Фильм',
    3: 'Тариф',
    4: 'Подтверждение'
  }
  return labels[step]
}
const conditionLabel = (condition) => {
  const labels = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое'
  }
  return labels[condition] || condition
}
const selectClient = (client) => {
  form.client = client._id
}
const selectCassette = (cassette) => {
  form.cassette = cassette._id
}
const selectMovie = (movie) => {
  selectedMovie.value = movie._id
  form.cassette = ''
}
const backToMovieSelection = () => {
  selectedMovie.value = null
  cassetteSearch.value = ''
}
const selectTariff = (tariff) => {
  form.tariff = tariff._id
  calculateCost()
}
const showTariffDetails = (tariff) => {
  selectedTariffForDetails.value = tariff
  showTariffDetailModal.value = true
}
const calculateCost = async () => {
  if (!form.tariff || !form.days || !form.cassette) return
  try {
    const cassette = cassettes.value.find(c => c._id === form.cassette)
    if (!cassette) return
    const response = await tariffsAPI.calculate({
      tariffId: form.tariff,
      days: form.days,
      movieId: cassette.movie._id
    })
    costCalculation.value = response.data
  } catch (error) {

  }
}
const loadData = async () => {
  try {
    const [clientsRes, cassettesRes, tariffsRes, moviesRes] = await Promise.all([
      clientsAPI.getAll({ limit: 1000 }),
      cassettesAPI.getAll({ limit: 1000, status: 'available' }),
      tariffsAPI.getAll({ isActive: true, limit: 1000 }),
      moviesAPI.getAll({ limit: 1000 })
    ])
    clients.value = clientsRes.data.clients || []
    cassettes.value = cassettesRes.data.cassettes || []
    tariffs.value = tariffsRes.data.tariffs || []
    const allMovies = moviesRes.data.movies || []
    movies.value = allMovies.map(movie => ({
      ...movie,
      availableCassettes: cassettes.value.filter(c => c.movie._id === movie._id).length
    })).filter(movie => movie.availableCassettes > 0)
  } catch (error) {
    notifications.error('Ошибка загрузки данных')
  }
}
const handleNext = async () => {
  if (currentStep.value < 4) {
    currentStep.value++
    if (currentStep.value === 3) {
      if (!form.tariff && tariffs.value.length > 0) {
        const defaultTariff = tariffs.value.find(t => t.isDefault) || tariffs.value[0]
        selectTariff(defaultTariff)
      }
    }
  } else {
    await handleSubmit()
  }
}
const handleBack = () => {
  if (currentStep.value === 1) {
    close()
  } else if (currentStep.value === 2 && selectedMovie.value) {
    backToMovieSelection()
  } else {
    currentStep.value--
  }
}
const handleSubmit = async () => {
  loading.value = true
  try {
    await rentalsAPI.create({
      clientId: form.client,
      cassetteId: form.cassette,
      tariffId: form.tariff,
      days: form.days
    })
    notifications.success('Аренда создана успешно')
    emit('submit')
    close()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка создания аренды')
  } finally {
    loading.value = false
  }
}
const close = () => {
  isOpen.value = false
  currentStep.value = 1
  form.client = ''
  form.cassette = ''
  form.tariff = ''
  form.days = 3
  costCalculation.value = null
  clientSearch.value = ''
  cassetteSearch.value = ''
  movieSearch.value = ''
  selectedMovie.value = null
}
onMounted(() => {
  loadData()
})
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadData()
  }
})
</script>
<style scoped>
.step-progress {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}
.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}
.step-number {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}
.step-item.active .step-number {
  background: var(--primary-color);
  color: white;
}
.step-item.completed .step-number {
  background: var(--success-color);
  color: white;
}
.step-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: center;
}
.step-item.active .step-label {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.step-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.step-content h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}
.selection-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}
.selection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.selection-item:hover {
  border-color: var(--border-light);
  background: var(--bg-tertiary);
}
.selection-item.selected {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}
.item-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.item-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
}
.item-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.check-icon {
  color: var(--primary-color);
}
.tariff-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}
.tariff-card {
  position: relative;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}
.tariff-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.tariff-card-content {
  flex: 1;
  padding: var(--spacing-lg);
  cursor: pointer;
}
.tariff-actions {
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(0, 0, 0, 0.2);
}
.tariff-details-btn {
  width: 100%;
  padding: var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.tariff-details-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.tariff-card.selected {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}
.tariff-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--spacing-sm);
}
.tariff-name {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-base);
}
.tariff-price {
  color: var(--primary-color);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  white-space: nowrap;
}
.tariff-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--spacing-sm);
}
.tariff-discounts {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}
.discounts-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.discount-item {
  font-size: var(--text-xs);
  color: var(--success-color);
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.discount-item strong {
  color: var(--success-color);
  font-weight: var(--font-bold);
}
.check-icon-tariff {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  color: var(--primary-color);
}
.duration-input {
  margin-top: var(--spacing-md);
}
.cost-preview {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.cost-preview h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-base);
  color: var(--text-primary);
}
.cost-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.cost-row.discount {
  color: var(--success-color);
}
.cost-row.total {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.cost-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}
.cost-row.total .cost-value {
  color: var(--primary-color);
  font-size: var(--text-lg);
}
.review-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}
.review-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}
.review-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.review-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  text-align: right;
}
.final-cost {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 2px solid var(--primary-color);
}
.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}
.cost-breakdown .cost-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.discount-row {
  color: var(--success-color);
  font-weight: var(--font-medium);
}
.final-cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
.final-cost-value {
  color: var(--primary-color);
  font-size: var(--text-2xl);
}
.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}
.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}
.empty-state p {
  margin: 0;
  font-size: var(--text-sm);
}
.movie-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.movie-card:hover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}
.movie-card.selected {
  border-color: var(--primary-color);
  background: rgba(220, 38, 38, 0.1);
}
.cassette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}
.cassette-header h3 {
  margin: 0;
}
.cassette-item {
  min-height: 80px;
}
.cassette-details {
  flex: 1;
}
.cassette-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}
.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.info-item svg {
  flex-shrink: 0;
}

.cost-preview {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(220, 38, 38, 0.02));
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
}
.cost-preview-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}
.cost-preview-header h4 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
.cost-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  font-size: var(--text-base);
}
.cost-row span:first-child {
  color: var(--text-secondary);
}
.cost-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.cost-row.subtotal {
  border-top: 1px dashed var(--border-color);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-xs);
}
.cost-row.discount-applied {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--success-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin: var(--spacing-sm) 0;
}
.discount-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--success-color);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
}
.discount-value {
  color: var(--success-color);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}
.cost-row.total {
  border-top: 2px solid var(--primary-color);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
  font-size: var(--text-lg);
}
.cost-value-total {
  font-weight: var(--font-bold);
  color: var(--primary-color);
  font-size: 1.5rem;
}
</style>
