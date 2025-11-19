<template>
  <header class="app-header">
    <div class="header-logo">
      <Icon name="film" :size="24" />
      <span>CineVault</span>
    </div>
    <div class="header-user">
      <div class="user-info">
        <Icon name="user" :size="18" />
        <span class="header-user-name">{{ user?.fullName }}</span>
        <span class="user-role">{{ user?.role === 'admin' ? 'Админ' : 'Кассир' }}</span>
      </div>
      <button class="logout-button" @click="handleLogout" title="Выход">
        <Icon name="logOut" :size="18" />
      </button>
    </div>
  </header>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import Icon from '@/components/common/Icon.vue'
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
<style scoped>
@import '@/styles/layout/header.css';
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.user-role {
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.logout-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.logout-button:hover {
  background: var(--danger-color);
  border-color: var(--danger-color);
  color: white;
}
</style>
