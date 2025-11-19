<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать сотрудника' : 'Новый сотрудник'"
    size="medium"
  >
    <form @submit.prevent="handleSubmit" class="employee-form">
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
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="example@mail.ru"
            :error="errors.email"
          />
          <AppInput
            v-model="form.phone"
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            :error="errors.phone"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="form.birthDate"
            label="Дата рождения"
            type="date"
          />
          <AppInput
            v-model="form.hireDate"
            label="Дата найма"
            type="date"
          />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Учетные данные</h3>
        <AppInput
          v-model="form.login"
          label="Логин"
          placeholder="ivanov"
          required
          :disabled="isEdit"
          :error="errors.login"
        />
        <AppInput
          v-if="!isEdit"
          v-model="form.password"
          label="Пароль"
          type="password"
          placeholder="Минимум 6 символов"
          required
          :error="errors.password"
        />
        <div v-if="isEdit" class="info-message">
          <span>Логин нельзя изменить после создания</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Роль и статус</h3>
        <div class="form-row">
          <AppSelect
            v-model="form.role"
            label="Роль"
            :options="roleOptions"
            required
            :error="errors.role"
          />
          <div class="checkbox-container">
            <label class="checkbox-label-inline">
              <input type="checkbox" v-model="form.isActive" class="checkbox-input" />
              <span class="checkbox-text">Активный сотрудник</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Дополнительно</h3>
        <div class="form-group">
          <label class="form-label">Заметки</label>
          <textarea
            v-model="form.bio"
            class="form-textarea"
            placeholder="Дополнительная информация о сотруднике..."
            rows="3"
            maxlength="500"
          ></textarea>
          <span class="char-counter" v-if="form.bio">
            {{ form.bio.length }}/500 символов
          </span>
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
import employeesAPI from '@/api/employees'
import notifications from '@/utils/notifications'
import { required, email, minLength } from '@/utils/validators'
const props = defineProps({
  modelValue: Boolean,
  employee: Object
})
const emit = defineEmits(['update:modelValue', 'submit'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const isEdit = computed(() => !!props.employee)
const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'cashier', label: 'Кассир' }
]
const form = reactive({
  fullName: '',
  login: '',
  email: '',
  phone: '',
  password: '',
  role: '',
  isActive: true,
  birthDate: '',
  hireDate: new Date().toISOString().split('T')[0],
  bio: ''
})
const errors = reactive({})
const loading = ref(false)
watch(() => props.employee, (employee) => {
  if (employee) {
    Object.assign(form, {
      fullName: employee.fullName,
      login: employee.login,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      isActive: employee.isActive !== undefined ? employee.isActive : true,
      birthDate: employee.birthDate?.split('T')[0] || '',
      hireDate: employee.hireDate?.split('T')[0] || form.hireDate,
      bio: employee.bio || ''
    })
    form.password = ''
  } else {
    form.fullName = ''
    form.login = ''
    form.email = ''
    form.phone = ''
    form.password = ''
    form.role = ''
    form.isActive = true
    form.birthDate = ''
    form.hireDate = new Date().toISOString().split('T')[0]
    form.bio = ''
  }
})
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.employee) {
    form.fullName = ''
    form.login = ''
    form.email = ''
    form.phone = ''
    form.password = ''
    form.role = ''
    form.isActive = true
    form.birthDate = ''
    form.hireDate = new Date().toISOString().split('T')[0]
    form.bio = ''
  }
})
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  errors.fullName = required(form.fullName)
  errors.login = minLength(3)(form.login)
  if (form.email) errors.email = email(form.email)
  if (!isEdit.value) errors.password = minLength(6)(form.password)
  errors.role = required(form.role)
  return Object.values(errors).every(e => e === null || e === '')
}
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const submitData = { ...form }
    if (isEdit.value) {
      delete submitData.password
      delete submitData.login
    }
    if (isEdit.value) {
      await employeesAPI.update(props.employee._id, submitData)
      notifications.success('Сотрудник обновлён')
    } else {
      await employeesAPI.create(submitData)
      notifications.success('Сотрудник создан')
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
.employee-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
