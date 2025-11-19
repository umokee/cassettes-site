<template>
  <div class="app-select-wrapper">
    <label v-if="label" :for="id" class="app-select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      :required="required"
      class="app-select"
      :class="{ 'app-select-error': error }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">{{ placeholder || 'Выберите...' }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="app-select-error-message">{{ error }}</span>
  </div>
</template>
<script setup>
defineProps({
  id: String,
  label: String,
  modelValue: [String, Number],
  options: Array,
  placeholder: String,
  required: Boolean,
  error: String
})
defineEmits(['update:modelValue'])
</script>
<style scoped>
.app-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.app-select-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: 0.01em;
}
.required {
  color: var(--danger-color);
}
.app-select {
  width: 100%;
  padding: 0.625rem var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1.5;
  height: 42px;
}
.app-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background-color: var(--bg-primary);
}
.app-select:hover:not(:focus) {
  border-color: var(--border-light);
}
.app-select-error {
  border-color: var(--danger-color);
}
.app-select-error-message {
  margin-top: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--danger-color);
  font-weight: var(--font-medium);
}
</style>
