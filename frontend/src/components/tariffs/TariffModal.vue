<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать тариф' : 'Новый тариф'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="tariff-form">
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        <AppInput
          v-model="form.name"
          label="Название тарифа"
          placeholder="Например: Стандартный"
          required
          :error="errors.name"
        />
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Описание условий тарифа..."
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Стоимость</h3>
        <div class="form-row">
          <AppInput
            v-model.number="form.basePricePerDay"
            label="Цена за день (₽)"
            type="number"
            step="0.01"
            min="0"
            required
            :error="errors.basePricePerDay"
          />
          <AppInput
            v-model.number="form.overdueMultiplier"
            label="Множитель просрочки"
            type="number"
            step="0.1"
            min="1"
            required
            :error="errors.overdueMultiplier"
          />
        </div>
        <div class="form-info">
          <Icon name="info" :size="16" />
          <span>Множитель просрочки определяет, во сколько раз увеличивается штраф за просроченный день (например, 2 = двойная цена)</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Штрафы за повреждения</h3>
        <div class="form-row">
          <AppInput
            v-model.number="form.damageMultipliers.excellent"
            label="Отличное → Хорошее"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
          />
          <AppInput
            v-model.number="form.damageMultipliers.good"
            label="Хорошее → Удовл."
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model.number="form.damageMultipliers.fair"
            label="Удовл. → Плохое"
            type="number"
            step="0.1"
            min="0"
            placeholder="0.5"
          />
          <AppInput
            v-model.number="form.damageMultipliers.poor"
            label="Плохое состояние"
            type="number"
            step="0.1"
            min="0"
            placeholder="1"
          />
        </div>
        <div class="form-info">
          <Icon name="info" :size="16" />
          <span>Множитель от стоимости покупки кассеты. Например, 0.5 = 50% от цены покупки</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Жанры фильмов</h3>
        <AppMultiSelect
          v-model="form.allowedGenres"
          label="Доступные жанры"
          :options="genreOptions"
          placeholder="Выберите жанры для тарифа"
        />
        <div class="form-info">
          <Icon name="info" :size="16" />
          <span>Тариф будет доступен только для фильмов выбранных жанров. Если не выбрано ни одного жанра, тариф доступен для всех фильмов.</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Скидки по длительности</h3>
        <div class="form-row">
          <AppInput
            v-model.number="form.minDays"
            label="Минимум дней"
            type="number"
            min="1"
            placeholder="7"
          />
          <AppInput
            v-model.number="form.discount"
            label="Скидка (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="10"
          />
        </div>
        <div class="form-info">
          <Icon name="info" :size="16" />
          <span>Скидка применяется при аренде на указанное количество дней и более</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Настройки</h3>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isActive" class="checkbox-input" />
            <span class="checkbox-text">
              <span class="checkbox-title">Активный тариф</span>
              <span class="checkbox-description">Доступен для выбора при создании аренды</span>
            </span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isDefault" class="checkbox-input" />
            <span class="checkbox-text">
              <span class="checkbox-title">Тариф по умолчанию</span>
              <span class="checkbox-description">Будет выбран автоматически</span>
            </span>
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <AppButton type="button" variant="outline" @click="close">
          Отмена
        </AppButton>
        <AppButton type="submit" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppMultiSelect from '@/components/common/AppMultiSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import Icon from '@/components/common/Icon.vue'
import tariffsAPI from '@/api/tariffs'
import genresAPI from '@/api/genres'
import notifications from '@/utils/notifications'
import { required, positive } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  tariff: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.tariff)
const form = reactive({
  name: '',
  description: '',
  basePricePerDay: '',
  overdueMultiplier: 2,
  damageMultipliers: {
    excellent: 0,
    good: 0,
    fair: 0.5,
    poor: 1
  },
  allowedGenres: [],
  minDays: '',
  discount: '',
  isActive: true,
  isDefault: false
})
const errors = reactive({})
const loading = ref(false)
const genreOptions = ref([])
const loadGenres = async () => {
  try {
    const { data } = await genresAPI.getAll({ limit: 1000 })
    genreOptions.value = data.genres.map(g => ({
      value: g._id,
      label: g.name
    }))
  } catch (error) {
    console.error('Ошибка загрузки жанров:', error)
    notifications.error('Ошибка загрузки жанров')
  }
}
onMounted(() => {
  loadGenres()
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && genreOptions.value.length === 0) {
    loadGenres()
  }
})
watch(() => props.tariff, (tariff) => {
  if (tariff) {
    const firstDiscount = tariff.durationDiscounts?.[0] || {}
    Object.assign(form, {
      name: tariff.name,
      description: tariff.description || '',
      basePricePerDay: tariff.basePricePerDay,
      overdueMultiplier: tariff.overdueMultiplier || 2,
      damageMultipliers: tariff.damageMultipliers || {
        excellent: 0,
        good: 0,
        fair: 0.5,
        poor: 1
      },
      allowedGenres: tariff.allowedGenres?.map(g => g._id || g) || [],
      minDays: firstDiscount.minDays || '',
      discount: firstDiscount.discount || '',
      isActive: tariff.isActive !== undefined ? tariff.isActive : true,
      isDefault: tariff.isDefault || false
    })
  } else {
    form.name = ''
    form.description = ''
    form.basePricePerDay = ''
    form.overdueMultiplier = 2
    form.damageMultipliers = {
      excellent: 0,
      good: 0,
      fair: 0.5,
      poor: 1
    }
    form.allowedGenres = []
    form.minDays = ''
    form.discount = ''
    form.isActive = true
    form.isDefault = false
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.name = required(form.name)
  errors.basePricePerDay = positive(form.basePricePerDay)
  errors.overdueMultiplier = form.overdueMultiplier < 1 ? 'Множитель должен быть не менее 1' : null
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const durationDiscounts = []
    if (form.minDays && form.discount) {
      durationDiscounts.push({
        minDays: form.minDays,
        discount: form.discount
      })
    }

    const submitData = {
      name: form.name,
      description: form.description,
      basePricePerDay: form.basePricePerDay,
      overdueMultiplier: form.overdueMultiplier,
      damageMultipliers: form.damageMultipliers,
      allowedGenres: form.allowedGenres,
      durationDiscounts,
      isActive: form.isActive,
      isDefault: form.isDefault
    }

    if (isEdit.value) {
      await tariffsAPI.update(props.tariff._id, submitData)
      notifications.success('Тариф обновлён')
    } else {
      await tariffsAPI.create(submitData)
      notifications.success('Тариф создан')
    }
    emit('submit')
    close()
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка сохранения')
  } finally {
    loading.value = false
  }
}
const close = () => {
  isOpen.value = false
}
</script>
<style scoped>
@import '@/styles/components/forms.css';
.tariff-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-info {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
  padding: var(--spacing-md);
  background: rgba(220, 38, 38, 0.05);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>
