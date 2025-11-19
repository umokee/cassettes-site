<template>
  <div class="app-layout">
    <AppHeader />
    <div class="layout-main">
      <AppSidebar />
      <main class="layout-content">
        <slot />
      </main>
    </div>
  </div>
</template>
<script setup>
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>
<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}
.layout-main {
  display: flex;
  min-height: calc(100vh - 64px);
}
.layout-content {
  flex: 1;
  margin-left: 250px;
  padding: var(--spacing-2xl);
  max-width: 1600px;
  width: 100%;
}
</style>
