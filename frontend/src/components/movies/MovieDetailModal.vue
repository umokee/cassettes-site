<template>
  <AppModal v-model="isOpen" title="Информация о фильме" size="large">
    <div v-if="movie" class="movie-details">
      <div v-if="movie.coverUrl && movie.coverUrl !== '/images/default-cover.jpg'" class="movie-cover">
        <img :src="movie.coverUrl" :alt="movie.title" />
      </div>
      <div class="detail-section">
        <h3 class="section-title">Основная информация</h3>
        <div class="detail-row">
          <span class="detail-label">Название:</span>
          <span class="detail-value">{{ movie.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Жанры:</span>
          <span class="detail-value">{{ formatGenres(movie.genres) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Год выпуска:</span>
          <span class="detail-value">{{ movie.year }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Режиссёр:</span>
          <span class="detail-value">{{ movie.director || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Длительность:</span>
          <span class="detail-value">{{ movie.duration }} мин</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Рейтинг:</span>
          <span class="detail-value">{{ movie.rating || 'Не указан' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="movie.isActive ? 'status-active' : 'status-inactive'">
            {{ movie.isActive ? 'Активен' : 'Неактивен' }}
          </span>
        </div>
      </div>
      <div v-if="movie.description" class="detail-section">
        <h3 class="section-title">Описание</h3>
        <p class="movie-description">{{ movie.description }}</p>
      </div>
      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Добавлен в систему:</span>
          <span class="detail-value">{{ formatDate(movie.createdAt) }}</span>
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
  movie: Object
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const formatGenres = (genres) => {
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return '-'
  }
  return genres.map(g => g.name || g).join(', ')
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
.movie-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.movie-cover {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.movie-cover img {
  width: 100%;
  height: auto;
  display: block;
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
.movie-description {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}
</style>
