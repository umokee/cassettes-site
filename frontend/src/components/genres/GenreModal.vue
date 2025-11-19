<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать жанр' : 'Новый жанр'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="genre-form">
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        <AppInput
          v-model="form.name"
          label="Название жанра"
          placeholder="Например: Боевик"
          required
          :error="errors.name"
        />
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Краткое описание жанра..."
            rows="3"
            maxlength="500"
          ></textarea>
          <span class="char-counter" v-if="form.description">
            {{ form.description.length }}/500 символов
          </span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Статус</h3>
        <div class="checkbox-container">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isActive" class="checkbox-input" />
            <span class="checkbox-text">
              <span class="checkbox-title">Активный жанр</span>
              <span class="checkbox-description">Доступен для выбора при создании фильмов</span>
            </span>
          </label>
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
import { ref, reactive, watch, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import genresAPI from '@/api/genres'
import notifications from '@/utils/notifications'
import { required } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  genre: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.genre)
const form = reactive({
  name: '',
  description: '',
  isActive: true
})
const errors = reactive({})
const loading = ref(false)
watch(() => props.genre, (genre) => {
  if (genre) {
    Object.assign(form, {
      name: genre.name,
      description: genre.description || '',
      isActive: genre.isActive !== undefined ? genre.isActive : true
    })
  } else {
    form.name = ''
    form.description = ''
    form.isActive = true
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.name = required(form.name)
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    if (isEdit.value) {
      await genresAPI.update(props.genre._id, form)
      notifications.success('Жанр обновлён')
    } else {
      await genresAPI.create(form)
      notifications.success('Жанр создан')
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
.genre-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
