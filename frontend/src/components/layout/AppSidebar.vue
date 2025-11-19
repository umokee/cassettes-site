<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link to="/" class="sidebar-link">
        <Icon name="home" :size="18" />
        <span>Dashboard</span>
      </router-link>
      <div class="sidebar-divider"></div>
      <router-link to="/clients" class="sidebar-link">
        <Icon name="users" :size="18" />
        <span>Клиенты</span>
      </router-link>
      <router-link to="/rentals" class="sidebar-link">
        <Icon name="disc" :size="18" />
        <span>Аренды</span>
      </router-link>
      <router-link to="/movies" class="sidebar-link">
        <Icon name="film" :size="18" />
        <span>Фильмы</span>
      </router-link>
      <router-link to="/cassettes" class="sidebar-link">
        <Icon name="database" :size="18" />
        <span>Кассеты</span>
      </router-link>
      <template v-if="isAdmin">
        <div class="sidebar-divider"></div>
        <router-link to="/genres" class="sidebar-link">
          <Icon name="tag" :size="18" />
          <span>Жанры</span>
        </router-link>
        <router-link to="/tariffs" class="sidebar-link">
          <Icon name="dollarSign" :size="18" />
          <span>Тарифы</span>
        </router-link>
        <router-link to="/employees" class="sidebar-link">
          <Icon name="briefcase" :size="18" />
          <span>Сотрудники</span>
        </router-link>
      </template>
      <div class="sidebar-divider"></div>
      <router-link to="/profile" class="sidebar-link">
        <Icon name="user" :size="18" />
        <span>Профиль</span>
      </router-link>
    </nav>
  </aside>
</template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import Icon from '@/components/common/Icon.vue'
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>
<style scoped>
@import '@/styles/layout/sidebar.css';
.sidebar-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-md) 0;
}
</style>
