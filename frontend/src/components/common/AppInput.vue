<template>
  <div class="app-input-wrapper">
    <label v-if="label" :for="id" class="app-input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="app-input"
      :class="{ 'app-input-error': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="app-input-error-message">{{ error }}</span>
  </div>
</template>
<script setup>
defineProps({
  id: String,
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  modelValue: [String, Number],
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String
})
defineEmits(['update:modelValue'])
</script>
<style scoped>
.app-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.app-input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: 0.01em;
}
.required {
  color: var(--danger-color);
}
.app-input {
  width: 100%;
  padding: 0.75rem var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  line-height: 1.5;
}
.app-input::placeholder {
  color: var(--text-muted);
}
.app-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--bg-tertiary);
}
.app-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background-color: var(--bg-primary);
}
.app-input:hover:not(:disabled):not(:focus) {
  border-color: var(--border-light);
}
.app-input-error {
  border-color: var(--danger-color);
}
.app-input-error-message {
  margin-top: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--danger-color);
  font-weight: var(--font-medium);
}
</style>
