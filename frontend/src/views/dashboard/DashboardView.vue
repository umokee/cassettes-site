<template>
  <AppLayout>
    <div class="dashboard">
      <h1 class="dashboard-title">Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <Icon name="users" :size="24" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Всего клиентов</p>
            <p class="stat-value">{{ stats.totalClients || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <Icon name="disc" :size="24" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Активные аренды</p>
            <p class="stat-value">{{ stats.activeRentals || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <Icon name="alertCircle" :size="24" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Просроченные</p>
            <p class="stat-value">{{ stats.overdueRentals || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-accent">
            <Icon name="film" :size="24" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Всего фильмов</p>
            <p class="stat-value">{{ stats.totalMovies || 0 }}</p>
          </div>
        </div>
      </div>
      <div class="activity-section">
        <h2 class="section-title">
          <Icon name="activity" :size="20" />
          Последние действия
        </h2>
        <div v-if="loading" class="activity-loading">
          Загрузка...
        </div>
        <div v-else-if="activities.length === 0" class="activity-empty">
          Нет записей активности
        </div>
        <div v-else class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity._id"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-action-${activity.type.split('_')[1]}`">
              <Icon :name="getActivityIcon(activity.type)" :size="18" />
            </div>
            <div class="activity-details">
              <p class="activity-action">{{ activity.action }}</p>
              <div class="activity-meta">
                <span class="activity-employee">
                  <Icon name="user" :size="14" />
                  {{ activity.employee?.fullName }}
                </span>
                <span class="activity-time">
                  <Icon name="clock" :size="14" />
                  {{ formatActivityTime(activity.createdAt) }}
                </span>
              </div>
            </div>
            <div class="activity-badge" :class="`badge-${activity.type.split('_')[1]}`">
              {{ getActionLabel(activity.type) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import statsAPI from '@/api/stats'
import notifications from '@/utils/notifications'
const stats = ref({
  totalClients: 0,
  activeRentals: 0,
  overdueRentals: 0,
  totalMovies: 0
})
const activities = ref([])
const loading = ref(true)
const fetchStats = async () => {
  try {
    const { data } = await statsAPI.getDashboard()
    stats.value = data
  } catch (error) {
    notifications.error('Ошибка загрузки статистики')
  }
}
const fetchActivities = async () => {
  loading.value = true
  try {
    const { data } = await statsAPI.getActivity({ limit: 15 })
    activities.value = data
  } catch (error) {
    notifications.error('Ошибка загрузки активности')
  } finally {
    loading.value = false
  }
}
const getActivityIcon = (type) => {
  const iconMap = {
    client_create: 'plus',
    client_update: 'edit',
    client_delete: 'trash',
    rental_create: 'plus',
    rental_return: 'check',
    movie_create: 'plus',
    movie_update: 'edit',
    movie_delete: 'trash',
    cassette_create: 'plus',
    cassette_update: 'edit',
    cassette_delete: 'trash',
    genre_create: 'plus',
    genre_update: 'edit',
    genre_delete: 'trash',
    tariff_create: 'plus',
    tariff_update: 'edit',
    tariff_delete: 'trash',
    employee_create: 'plus',
    employee_update: 'edit',
    employee_delete: 'trash',
    login: 'user'
  }
  return iconMap[type] || 'activity'
}
const getActionLabel = (type) => {
  const labels = {
    create: 'Создание',
    update: 'Изменение',
    delete: 'Удаление',
    return: 'Возврат',
    login: 'Вход'
  }
  const action = type.split('_')[1]
  return labels[action] || action
}
const formatActivityTime = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffMs = now - activityDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} дн назад`
  return activityDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
onMounted(() => {
  fetchStats()
  fetchActivities()
})
</script>
<style scoped>
.dashboard {
  max-width: 1400px;
}
.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-fast);
}
.stat-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon-primary {
  background: rgba(220, 38, 38, 0.1);
  color: var(--primary-color);
}
.stat-icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.stat-icon-danger {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-color);
}
.stat-icon-accent {
  background: rgba(251, 191, 36, 0.1);
  color: var(--accent-color);
}
.stat-content {
  flex: 1;
}
.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.activity-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}
.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}
.activity-loading,
.activity-empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.activity-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.activity-item:hover {
  border-color: var(--border-light);
  background: var(--bg-elevated);
}
.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.activity-action-create {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.activity-action-update {
  background: rgba(251, 191, 36, 0.1);
  color: var(--accent-color);
}
.activity-action-delete {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-color);
}
.activity-action-return {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.activity-action-login {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-secondary);
}
.activity-details {
  flex: 1;
  min-width: 0;
}
.activity-action {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}
.activity-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.activity-employee,
.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
}
.activity-badge {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.badge-create {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.badge-update {
  background: rgba(251, 191, 36, 0.1);
  color: var(--accent-color);
}
.badge-delete {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-color);
}
.badge-return {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}
.badge-login {
  background: rgba(100, 116, 139, 0.1);
  color: var(--secondary-color);
}
</style>
