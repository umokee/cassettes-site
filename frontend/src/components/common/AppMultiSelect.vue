<template>
  <div class="multi-select">
    <label v-if="label" class="multi-select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="multi-select-options">
      <label
        v-for="option in options"
        :key="option.value"
        class="multi-select-option"
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="isSelected(option.value)"
          @change="handleChange(option.value)"
          class="multi-select-checkbox"
        />
        <span class="multi-select-text">{{ option.label }}</span>
      </label>
    </div>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
  },
  label: String,
  required: Boolean,
  error: String
})
const emit = defineEmits(['update:modelValue'])
const isSelected = (value) => {
  return props.modelValue.includes(value)
}
const handleChange = (value) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(value)
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(value)
  }
  emit('update:modelValue', newValue)
}
</script>
<style scoped>
.multi-select {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.multi-select-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}
.required {
  color: var(--danger-color);
}
.multi-select-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
.multi-select-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}
.multi-select-option:hover {
  background-color: var(--bg-tertiary);
}
.multi-select-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}
.multi-select-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
}
.error-message {
  font-size: var(--text-xs);
  color: var(--danger-color);
}
</style>
