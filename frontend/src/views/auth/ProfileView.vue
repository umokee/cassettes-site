<template>
  <AppLayout>
    <div class="profile-view">
      <div class="profile-header">
        <div class="profile-avatar">
          <Icon name="user" :size="32" />
        </div>
        <div class="profile-header-info">
          <h1 class="profile-title">{{ user?.fullName }}</h1>
          <div class="profile-role-badge">
            <Icon name="briefcase" :size="16" />
            {{ user?.role === 'admin' ? 'Администратор' : 'Кассир' }}
          </div>
        </div>
      </div>
      <div class="profile-sections">
        <div class="profile-card">
          <div class="card-header">
            <div class="card-title">
              <Icon name="user" :size="20" />
              <h2>Личная информация</h2>
            </div>
          </div>
          <form @submit.prevent="handleUpdateProfile" class="profile-form">
            <div class="form-group">
              <label class="form-label">
                <Icon name="user" :size="16" />
                ФИО
              </label>
              <AppInput
                v-model="profileForm.fullName"
                placeholder="Введите ФИО"
                required
                :error="profileErrors.fullName"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <Icon name="mail" :size="16" />
                Email
              </label>
              <AppInput
                v-model="profileForm.email"
                type="email"
                placeholder="Введите email"
                :error="profileErrors.email"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <Icon name="phone" :size="16" />
                Телефон
              </label>
              <AppInput
                v-model="profileForm.phone"
                type="tel"
                placeholder="Введите номер телефона"
                :error="profileErrors.phone"
              />
            </div>
            <div class="form-actions">
              <AppButton type="submit" :disabled="profileLoading">
                <Icon name="check" :size="18" />
                {{ profileLoading ? 'Сохранение...' : 'Сохранить изменения' }}
              </AppButton>
            </div>
          </form>
        </div>
        <div class="profile-card">
          <div class="card-header">
            <div class="card-title">
              <Icon name="lock" :size="20" />
              <h2>Смена пароля</h2>
            </div>
          </div>
          <form @submit.prevent="handleChangePassword" class="profile-form">
            <div class="form-group">
              <label class="form-label">
                <Icon name="lock" :size="16" />
                Текущий пароль
              </label>
              <AppInput
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Введите текущий пароль"
                required
                :error="passwordErrors.currentPassword"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <Icon name="lock" :size="16" />
                Новый пароль
              </label>
              <AppInput
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Введите новый пароль (минимум 6 символов)"
                required
                :error="passwordErrors.newPassword"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <Icon name="lock" :size="16" />
                Подтвердите новый пароль
              </label>
              <AppInput
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Введите новый пароль еще раз"
                required
                :error="passwordErrors.confirmPassword"
              />
            </div>
            <div class="form-actions">
              <AppButton type="submit" :disabled="passwordLoading">
                <Icon name="key" :size="18" />
                {{ passwordLoading ? 'Изменение...' : 'Изменить пароль' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
      <div class="info-section">
        <div class="info-card">
          <div class="card-header">
            <div class="card-title">
              <Icon name="briefcase" :size="20" />
              <h2>Информация о роли</h2>
            </div>
          </div>
          <div class="info-items">
            <div class="info-item">
              <div class="info-icon">
                <Icon name="briefcase" :size="18" />
              </div>
              <div class="info-content">
                <p class="info-label">Должность</p>
                <p class="info-value">{{ user?.role === 'admin' ? 'Администратор' : 'Кассир' }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <Icon name="user" :size="18" />
              </div>
              <div class="info-content">
                <p class="info-label">Логин</p>
                <p class="info-value">{{ user?.login }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <Icon name="mail" :size="18" />
              </div>
              <div class="info-content">
                <p class="info-label">Email</p>
                <p class="info-value">{{ user?.email || 'Не указан' }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <Icon name="phone" :size="18" />
              </div>
              <div class="info-content">
                <p class="info-label">Телефон</p>
                <p class="info-value">{{ user?.phone || 'Не указан' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/common/Icon.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import authAPI from '@/api/auth'
import notifications from '@/utils/notifications'
import { required, email, minLength } from '@/utils/validators'
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const profileForm = reactive({
  fullName: '',
  email: '',
  phone: ''
})
const profileErrors = reactive({})
const profileLoading = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordErrors = reactive({})
const passwordLoading = ref(false)
onMounted(() => {
  if (user.value) {
    profileForm.fullName = user.value.fullName
    profileForm.email = user.value.email || ''
    profileForm.phone = user.value.phone || ''
  }
})
const validateProfile = () => {
  profileErrors.fullName = required(profileForm.fullName)
  if (profileForm.email) {
    profileErrors.email = email(profileForm.email)
  }
  return Object.values(profileErrors).every(e => e === null || e === '')
}
const validatePassword = () => {
  passwordErrors.currentPassword = required(passwordForm.currentPassword)
  passwordErrors.newPassword = minLength(6)(passwordForm.newPassword)
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Пароли не совпадают'
  } else {
    passwordErrors.confirmPassword = null
  }
  return Object.values(passwordErrors).every(e => e === null || e === '')
}
const handleUpdateProfile = async () => {
  if (!validateProfile()) return
  profileLoading.value = true
  try {
    const updateData = {
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone
    }
    const { data } = await authAPI.updateProfile(updateData)
    authStore.updateUser(data)
    notifications.success('Профиль успешно обновлён')
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка обновления профиля')
  } finally {
    profileLoading.value = false
  }
}
const handleChangePassword = async () => {
  if (!validatePassword()) return
  passwordLoading.value = true
  try {
    await authAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    notifications.success('Пароль успешно изменён')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка изменения пароля')
  } finally {
    passwordLoading.value = false
  }
}
</script>
<style scoped>
.profile-view {
  max-width: 1200px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--danger-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
}
.profile-header-info {
  flex: 1;
}
.profile-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}
.profile-role-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
}
.profile-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}
.info-section {
  display: grid;
  grid-template-columns: 1fr;
}
.profile-card,
.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}
.card-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}
.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.card-title h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}
.info-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
.info-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(220, 38, 38, 0.1);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info-content {
  flex: 1;
  min-width: 0;
}
.info-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}
.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}
</style>
