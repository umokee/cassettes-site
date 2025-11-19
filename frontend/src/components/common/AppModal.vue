<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-content" :class="`modal-${size}`">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
  }
})
const emit = defineEmits(['update:modelValue', 'close'])
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
<style scoped>
@import '@/styles/components/modal.css';
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
