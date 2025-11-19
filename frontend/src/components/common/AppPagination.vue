<template>
  <div class="app-pagination">
    <AppButton
      size="small"
      variant="outline"
      :disabled="currentPage === 1"
      @click="$emit('change', currentPage - 1)"
    >
      Назад
    </AppButton>
    <span class="pagination-info">
      Страница {{ currentPage }} из {{ totalPages || 1 }}
    </span>
    <AppButton
      size="small"
      variant="outline"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      Вперёд
    </AppButton>
  </div>
</template>
<script setup>
import AppButton from './AppButton.vue'
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})
defineEmits(['change'])
</script>
<style scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}
.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
