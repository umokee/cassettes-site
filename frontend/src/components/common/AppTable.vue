<template>
  <div class="app-table-container">
    <table class="app-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="actions">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center">
            Нет данных
          </td>
        </tr>
        <tr v-for="item in data" :key="item._id || item.id">
          <td v-for="column in columns" :key="column.key">
            {{ formatValue(item, column) }}
          </td>
          <td v-if="actions" class="app-table-actions">
            <div class="actions-wrapper">
              <AppButton
                v-if="actions.includes('view')"
                size="small"
                variant="outline"
                @click="$emit('view', item)"
                title="Просмотр"
                class="action-view"
              >
                <Icon name="eye" :size="14" />
              </AppButton>
              <AppButton
                v-if="actions.includes('edit')"
                size="small"
                variant="primary"
                @click="$emit('edit', item)"
                title="Редактировать"
                class="action-edit"
              >
                <Icon name="edit" :size="14" />
              </AppButton>
              <AppButton
                v-if="actions.includes('toggle')"
                size="small"
                :variant="getToggleVariant(item)"
                @click="$emit('toggle', item)"
                :title="getToggleTitle(item)"
                class="action-toggle"
              >
                <Icon :name="getToggleIcon(item)" :size="14" />
              </AppButton>
              <AppButton
                v-if="actions.includes('delete')"
                size="small"
                variant="danger"
                @click="$emit('delete', item)"
                title="Удалить"
                class="action-delete"
              >
                <Icon name="trash" :size="14" />
              </AppButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import Icon from './Icon.vue'
import AppButton from './AppButton.vue'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters'
defineProps({
  columns: Array,
  data: Array,
  actions: Array
})
defineEmits(['view', 'edit', 'delete', 'toggle'])
const formatValue = (item, column) => {
  const keys = column.key.split('.')
  let value = item
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    value = value?.[key]
    if (Array.isArray(value) && i < keys.length - 1) {
      value = value[0]
    }
  }
  if (Array.isArray(value) && column.key.includes('genres')) {
    return value.map(g => g.name || g).join(', ') || '-'
  }
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет'
  }
  if (column.format === 'date') return formatDate(value)
  if (column.format === 'datetime') return formatDateTime(value)
  if (column.format === 'currency') return formatCurrency(value)
  if (column.format === 'status') return formatStatus(value, column.key)
  return value
}
const formatStatus = (status, key) => {
  if (key === 'status' && ['available', 'rented', 'damaged', 'lost'].includes(status)) {
    const cassetteStatuses = {
      available: 'Доступна',
      rented: 'Арендована',
      damaged: 'Повреждена',
      lost: 'Утеряна'
    }
    return cassetteStatuses[status] || status
  }
  if (key === 'status' && ['active', 'returned', 'overdue'].includes(status)) {
    const rentalStatuses = {
      active: 'Активна',
      returned: 'Возвращена',
      overdue: 'Просрочена'
    }
    return rentalStatuses[status] || status
  }
  if (key === 'status' && ['active', 'blocked', 'pending'].includes(status)) {
    const clientStatuses = {
      active: 'Активный',
      blocked: 'Заблокирован',
      pending: 'Ожидает подтверждения'
    }
    return clientStatuses[status] || status
  }
  return status
}
const getToggleVariant = (item) => {
  return 'secondary'
}
const getToggleIcon = (item) => {
  if (item.status) {
    return item.status === 'active' ? 'x' : 'check'
  }
  if (item.hasOwnProperty('isActive')) {
    return item.isActive ? 'x' : 'check'
  }
  return 'x'
}
const getToggleTitle = (item) => {
  if (item.status) {
    return item.status === 'active' ? 'Заблокировать' : 'Активировать'
  }
  if (item.hasOwnProperty('isActive')) {
    return item.isActive ? 'Деактивировать' : 'Активировать'
  }
  return 'Переключить'
}
</script>
<style scoped>
@import '@/styles/components/table.css';
</style>
