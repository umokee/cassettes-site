<template>
  <div class="app-search">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder || 'Поиск...'"
      class="app-search-input"
      @input="handleInput"
    />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  modelValue: String,
  placeholder: String
})
const emit = defineEmits(['update:modelValue', 'search'])
let debounceTimeout = null
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    emit('search')
  }, 500)
}
</script>
<style scoped>
.app-search {
  display: flex;
  gap: var(--spacing-md);
}
.app-search-input {
  flex: 1;
  padding: 0.625rem var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  line-height: 1.5;
  height: 42px;
}
.app-search-input::placeholder {
  color: var(--text-muted);
}
.app-search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background-color: var(--bg-primary);
}
.app-search-input:hover:not(:focus) {
  border-color: var(--border-light);
}
</style>
