<template>
  <AppLayout>
    <div class="genres-view">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon name="tag" :size="28" />
          </div>
          <div>
            <h1 class="page-title">Жанры</h1>
            <p class="page-subtitle">Управление жанрами фильмов</p>
          </div>
        </div>
        <AppButton v-if="isAdmin" @click="openCreateModal">
          <Icon name="plus" :size="18" />
          Добавить жанр
        </AppButton>
      </div>
      <div class="table-container">
        <AppTable
          :columns="columns"
          :data="genres"
          :actions="isAdmin ? ['edit', 'delete'] : []"
          @edit="editGenre"
          @delete="deleteGenre"
        />
      </div>
      <GenreModal
        v-model="showModal"
        :genre="selectedGenre"
        @submit="handleSubmit"
      />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppTable from '@/components/common/AppTable.vue'
import GenreModal from '@/components/genres/GenreModal.vue'
import genresAPI from '@/api/genres'
import { useAuthStore } from '@/store/modules/auth'
import notifications from '@/utils/notifications'
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const columns = [
  { key: 'name', label: 'Название' },
  { key: 'description', label: 'Описание' },
  { key: 'isActive', label: 'Активен' }
]
const genres = ref([])
const showModal = ref(false)
const selectedGenre = ref(null)
const fetchGenres = async () => {
  try {
    const { data } = await genresAPI.getAll()
    genres.value = data.genres || data
  } catch (error) {
    notifications.error('Ошибка загрузки жанров')
  }
}
const openCreateModal = () => {
  selectedGenre.value = null
  showModal.value = true
}
const editGenre = (genre) => {
  selectedGenre.value = genre
  showModal.value = true
}
const deleteGenre = async (genre) => {
  if (!confirm(`Удалить жанр "${genre.name}"?`)) return
  try {
    await genresAPI.delete(genre._id)
    notifications.success('Жанр удалён')
    fetchGenres()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка удаления жанра')
  }
}
const handleSubmit = async () => {
  showModal.value = false
  await fetchGenres()
}
onMounted(() => {
  fetchGenres()
})
</script>
<style scoped>
@import '@/styles/components/views.css';
.header-icon {
  background: var(--primary-color);
}
</style>
