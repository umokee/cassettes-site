<template>
  <button 
    :class="buttonClasses" 
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'outline'].includes(v)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean
})
const buttonClasses = computed(() => [
  'app-button',
  `app-button-${props.variant}`,
  `app-button-${props.size}`
])
</script>
<style scoped>
@import '@/styles/components/button.css';
</style>
