<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать клиента' : 'Новый клиент'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="client-form">
      <div class="form-section">
        <h3 class="section-title">Личная информация</h3>
        <AppInput
          v-model="form.fullName"
          label="ФИО"
          placeholder="Иванов Иван Иванович"
          required
          :error="errors.fullName"
        />
        <div class="form-row">
          <AppInput
            v-model="form.phone"
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            required
            :error="errors.phone"
          />
          <AppInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="example@mail.ru"
            :error="errors.email"
          />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Статус</h3>
        <AppSelect
          v-model="form.status"
          label="Статус клиента"
          :options="statusOptions"
          required
        />
      </div>
      <div class="form-section">
        <h3 class="section-title">Дополнительно</h3>
        <div class="form-group">
          <label class="form-label">Примечания</label>
          <textarea
            v-model="form.notes"
            class="form-textarea"
            placeholder="Дополнительная информация о клиенте..."
            rows="3"
          ></textarea>
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
import { ref, reactive, watch, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import clientsAPI from '@/api/clients'
import notifications from '@/utils/notifications'
import { required, email, phone } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  client: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.client)
const statusOptions = [
  { value: 'active', label: 'Активный' },
  { value: 'blocked', label: 'Заблокирован' },
  { value: 'pending', label: 'Ожидает подтверждения' }
]
const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  status: '',
  notes: ''
})
const errors = reactive({})
const loading = ref(false)
watch(() => props.client, (client) => {
  if (client) {
    Object.assign(form, {
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      status: client.status || 'active',
      notes: client.notes || ''
    })
  } else {
    form.fullName = ''
    form.phone = ''
    form.email = ''
    form.status = ''
    form.notes = ''
  }
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.client) {
    form.fullName = ''
    form.phone = ''
    form.email = ''
    form.status = ''
    form.notes = ''
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.fullName = required(form.fullName)
  errors.phone = phone(form.phone)
  if (form.email) errors.email = email(form.email)
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    if (isEdit.value) {
      await clientsAPI.update(props.client._id, form)
      notifications.success('Клиент обновлён')
    } else {
      await clientsAPI.create(form)
      notifications.success('Клиент создан')
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
.client-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
