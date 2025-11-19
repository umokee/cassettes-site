<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать кассету' : 'Новая кассета'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="cassette-form">
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        <AppSelect
          v-model="form.movieId"
          label="Фильм"
          :options="movieOptions"
          required
          :error="errors.movieId"
        />
        <AppInput
          v-if="isEdit"
          v-model="form.serialNumber"
          label="Инвентарный номер"
          :disabled="true"
        />
        <AppSelect
          v-model="form.format"
          label="Формат"
          :options="formatOptions"
          required
          :error="errors.format"
        />
      </div>
      <div class="form-section">
        <h3 class="section-title">Состояние и статус</h3>
        <div class="form-row">
          <AppSelect
            v-model="form.condition"
            label="Состояние кассеты"
            :options="conditionOptions"
            required
            :error="errors.condition"
          />
          <AppSelect
            v-model="form.status"
            label="Статус"
            :options="statusOptions"
            required
            :error="errors.status"
          />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Информация о покупке</h3>
        <div class="form-row">
          <AppInput
            v-model="form.purchaseDate"
            label="Дата покупки"
            type="date"
            required
            :error="errors.purchaseDate"
          />
          <AppInput
            v-model.number="form.purchasePrice"
            label="Цена покупки (₽)"
            type="number"
            step="0.01"
            required
            :error="errors.purchasePrice"
          />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Дополнительно</h3>
        <div class="form-group">
          <label class="form-label">Примечания</label>
          <textarea
            v-model="form.notes"
            class="form-textarea"
            placeholder="Дополнительная информация о кассете..."
            rows="3"
          ></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <AppButton type="button" variant="outline" @click="close">
          Отмена
        </AppButton>
        <AppButton type="submit" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import cassettesAPI from '@/api/cassettes'
import moviesAPI from '@/api/movies'
import notifications from '@/utils/notifications'
import { required, positive } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  cassette: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.cassette)
const conditionOptions = [
  { value: 'excellent', label: 'Отличное' },
  { value: 'good', label: 'Хорошее' },
  { value: 'fair', label: 'Удовлетворительное' },
  { value: 'poor', label: 'Плохое' }
]
const statusOptions = [
  { value: 'available', label: 'Доступна' },
  { value: 'rented', label: 'Арендована' },
  { value: 'damaged', label: 'Повреждена' },
  { value: 'lost', label: 'Утеряна' }
]
const formatOptions = [
  { value: 'VHS', label: 'VHS' },
  { value: 'Betamax', label: 'Betamax' },
  { value: 'Video8', label: 'Video8' },
  { value: 'Hi8', label: 'Hi8' }
]
const form = reactive({
  serialNumber: '',
  movieId: '',
  format: '',
  condition: '',
  status: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  purchasePrice: '',
  notes: ''
})
const errors = reactive({})
const loading = ref(false)
const movieOptions = ref([])
onMounted(async () => {
  try {
    const { data } = await moviesAPI.getAll({ limit: 1000 })
    movieOptions.value = data.movies.map(m => ({
      value: m._id,
      label: `${m.title} (${m.year || m.releaseYear})`
    }))
  } catch (error) {
    notifications.error('Ошибка загрузки фильмов')
  }
})
watch(() => props.cassette, (cassette) => {
  if (cassette) {
    Object.assign(form, {
      serialNumber: cassette.serialNumber,
      movieId: cassette.movie?._id || cassette.movieId || cassette.movie,
      format: cassette.format || 'VHS',
      condition: cassette.condition || 'good',
      status: cassette.status || 'available',
      purchaseDate: cassette.purchaseDate?.split('T')[0] || form.purchaseDate,
      purchasePrice: cassette.purchasePrice || '',
      notes: cassette.notes || ''
    })
  } else {
    form.serialNumber = ''
    form.movieId = ''
    form.format = ''
    form.condition = ''
    form.status = ''
    form.purchaseDate = new Date().toISOString().split('T')[0]
    form.purchasePrice = ''
    form.notes = ''
  }
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.cassette) {
    form.serialNumber = ''
    form.movieId = ''
    form.format = ''
    form.condition = ''
    form.status = ''
    form.purchaseDate = new Date().toISOString().split('T')[0]
    form.purchasePrice = ''
    form.notes = ''
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.movieId = required(form.movieId)
  errors.condition = required(form.condition)
  errors.status = required(form.status)
  errors.purchaseDate = required(form.purchaseDate)
  errors.purchasePrice = positive(form.purchasePrice)
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const submitData = {
      ...form,
      movie: form.movieId
    }
    delete submitData.movieId
    if (!isEdit.value) {
      delete submitData.serialNumber
    }
    if (isEdit.value) {
      await cassettesAPI.update(props.cassette._id, submitData)
      notifications.success('Кассета обновлена')
    } else {
      await cassettesAPI.create(submitData)
      notifications.success('Кассета создана')
    }
    emit('submit')
    close()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка сохранения')
  } finally {
    loading.value = false
  }
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
@import '@/styles/components/forms.css';
.cassette-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
