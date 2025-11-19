<template>
  <div class="filters-section">
    <AppSearch
      v-if="searchConfig"
      :model-value="searchConfig.value"
      @update:model-value="handleSearchUpdate"
      @search="$emit('search')"
      :placeholder="searchConfig.placeholder"
    />
    <div v-if="filters && filters.length > 1" class="filters">
      <AppSelect
        v-for="filter in filters"
        :key="filter.key"
        :model-value="filter.value"
        @update:model-value="(value) => handleFilterUpdate(filter.key, value)"
        :placeholder="filter.placeholder"
        :options="filter.options"
      />
    </div>
    <AppSelect
      v-else-if="filters && filters.length === 1"
      :model-value="filters[0].value"
      @update:model-value="(value) => handleFilterUpdate(filters[0].key, value)"
      :placeholder="filters[0].placeholder"
      :options="filters[0].options"
    />
  </div>
</template>

<script setup>
import AppSearch from './AppSearch.vue'
import AppSelect from './AppSelect.vue'

defineProps({
  searchConfig: {
    type: Object,
    default: null
  },
  filters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:search', 'update:filter', 'search'])

const handleSearchUpdate = (value) => {
  emit('update:search', value)
}

const handleFilterUpdate = (key, value) => {
  emit('update:filter', key, value)
}
</script>

<style scoped>
.filters-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  flex: 1;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
  }
}
</style>
