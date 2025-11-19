<template>
  <router-view />
</template>
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
const authStore = useAuthStore()
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchProfile()
    } catch (error) {

    }
  }
})
</script>
