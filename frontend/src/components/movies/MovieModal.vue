<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать фильм' : 'Новый фильм'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="movie-form">
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        <AppInput
          v-model="form.title"
          label="Название фильма"
          placeholder="Например: Терминатор"
          required
          :error="errors.title"
        />
        <AppMultiSelect
          v-model="form.genreIds"
          label="Жанры"
          :options="genreOptions"
          required
          :error="errors.genreIds"
        />
        <div class="form-row">
          <AppInput
            v-model.number="form.releaseYear"
            label="Год выпуска"
            type="number"
            min="1900"
            :max="new Date().getFullYear()"
            placeholder="1984"
            required
            :error="errors.releaseYear"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.director"
            label="Режиссёр"
            placeholder="Джеймс Кэмерон"
            required
            :error="errors.director"
          />
          <AppInput
            v-model.number="form.duration"
            label="Длительность (мин)"
            type="number"
            min="1"
            placeholder="107"
            required
            :error="errors.duration"
          />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Рейтинг и статус</h3>
        <div class="form-row">
          <AppSelect
            v-model="form.rating"
            label="Возрастной рейтинг"
            :options="ratingOptions"
            required
          />
          <div class="checkbox-container">
            <label class="checkbox-label-inline">
              <input type="checkbox" v-model="form.isActive" class="checkbox-input" />
              <span class="checkbox-text">Активный фильм (отображается в каталоге)</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Описание</h3>
        <AppInput
          v-model="form.coverUrl"
          label="URL обложки"
          placeholder="https://example.com/poster.jpg"
          :error="errors.coverUrl"
        />
        <div class="form-group">
          <label class="form-label">Описание фильма</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Краткое описание сюжета фильма..."
            rows="4"
            maxlength="1000"
          ></textarea>
          <span class="char-counter" v-if="form.description">
            {{ form.description.length }}/1000 символов
          </span>
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
import AppMultiSelect from '@/components/common/AppMultiSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import moviesAPI from '@/api/movies'
import genresAPI from '@/api/genres'
import notifications from '@/utils/notifications'
import { required, number } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  movie: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.movie)
const ratingOptions = [
  { value: 'Не указан', label: 'Не указан' },
  { value: 'G', label: 'G - Без ограничений' },
  { value: 'PG', label: 'PG - Рекомендуется присутствие родителей' },
  { value: 'PG-13', label: 'PG-13 - До 13 лет с родителями' },
  { value: 'R', label: 'R - До 17 лет с родителями' },
  { value: 'NC-17', label: 'NC-17 - С 17 лет' }
]
const form = reactive({
  title: '',
  genreIds: [],
  releaseYear: new Date().getFullYear(),
  director: '',
  duration: '',
  coverUrl: '',
  description: '',
  rating: '',
  isActive: true
})
const errors = reactive({})
const loading = ref(false)
const genreOptions = ref([])
const loadGenres = async () => {
  try {
    const { data } = await genresAPI.getAll({ limit: 1000 })
    genreOptions.value = data.genres.map(g => ({
      value: g._id,
      label: g.name
    }))
  } catch (error) {
    console.error('Ошибка загрузки жанров:', error)
    notifications.error('Ошибка загрузки жанров')
  }
}
onMounted(() => {
  loadGenres()
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && genreOptions.value.length === 0) {
    loadGenres()
  }
})
watch(() => props.movie, (movie) => {
  if (movie) {
    Object.assign(form, {
      title: movie.title,
      genreIds: movie.genres?.map(g => g._id || g) || [],
      releaseYear: movie.year || movie.releaseYear,
      director: movie.director || '',
      duration: movie.duration || '',
      coverUrl: movie.coverUrl || '',
      description: movie.description || '',
      rating: movie.rating || 'Не указан',
      isActive: movie.isActive !== undefined ? movie.isActive : true
    })
  } else {
    form.title = ''
    form.genreIds = []
    form.releaseYear = new Date().getFullYear()
    form.director = ''
    form.duration = ''
    form.coverUrl = ''
    form.description = ''
    form.rating = ''
    form.isActive = true
  }
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.movie) {
    form.title = ''
    form.genreIds = []
    form.releaseYear = new Date().getFullYear()
    form.director = ''
    form.duration = ''
    form.coverUrl = ''
    form.description = ''
    form.rating = ''
    form.isActive = true
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.title = required(form.title)
  errors.genreIds = form.genreIds.length === 0 ? 'Выберите хотя бы один жанр' : null
  errors.releaseYear = number(form.releaseYear)
  errors.director = required(form.director)
  errors.duration = number(form.duration)
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload = {
      title: form.title,
      genres: form.genreIds,
      year: form.releaseYear,
      director: form.director,
      duration: form.duration,
      coverUrl: form.coverUrl,
      description: form.description,
      rating: form.rating,
      isActive: form.isActive
    }
    if (isEdit.value) {
      await moviesAPI.update(props.movie._id, payload)
      notifications.success('Фильм обновлён')
    } else {
      await moviesAPI.create(payload)
      notifications.success('Фильм создан')
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
.movie-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
