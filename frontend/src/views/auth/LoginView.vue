<template>
  <div class="login-view">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Видеопрокат CineVault</h1>
        <p class="login-subtitle">Вход в систему</p>
      </div>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label">
            <Icon name="user" :size="18" />
            Логин
          </label>
          <AppInput
            v-model="form.login"
            type="text"
            placeholder="Введите логин"
            required
            :error="errors.login"
          />
        </div>
        <div class="form-group">
          <label class="form-label">
            <Icon name="lock" :size="18" />
            Пароль
          </label>
          <AppInput
            v-model="form.password"
            type="password"
            placeholder="Введите пароль"
            required
            :error="errors.password"
          />
        </div>
        <AppButton type="submit" size="large" :disabled="loading" class="login-button">
          {{ loading ? 'Вход...' : 'Войти' }}
        </AppButton>
      </form>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import Icon from '@/components/common/Icon.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import notifications from '@/utils/notifications'
const router = useRouter()
const authStore = useAuthStore()
const form = reactive({
  login: '',
  password: ''
})
const errors = reactive({})
const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  errors.login = ''
  errors.password = ''
  try {
    await authStore.login(form)
    notifications.success('Успешный вход')
    router.push('/')
  } catch (error) {
    notifications.error(error.response?.data?.message || 'Ошибка входа')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
}
.login-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.08) 0%, transparent 50%);
  pointer-events: none;
}
.login-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  width: 440px;
  max-width: 90%;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 20px 25px -5px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}
.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}
.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.5px;
}
.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}
.login-form {
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
.login-button {
  margin-top: var(--spacing-md);
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}
</style>
