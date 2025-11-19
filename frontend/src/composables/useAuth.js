import api from '@/api/axios';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
const user = ref(null);
const token = ref(localStorage.getItem('token'));
const loading = ref(false);
const error = ref(null);
export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isCashier = computed(() => user.value?.role === 'cashier');
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post('/auth/login', credentials);
      token.value = data.token;
      user.value = data.employee;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.employee));
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка входа';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };
  const fetchCurrentUser = async () => {
    if (!token.value) return null;
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get('/auth/me');
      user.value = data;
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка загрузки пользователя';
      logout();
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const updateUser = (updatedData) => {
    user.value = { ...user.value, ...updatedData };
    localStorage.setItem('user', JSON.stringify(user.value));
  };
  const initAuth = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser);
        token.value = storedToken;
      } catch (e) {
        logout();
      }
    }
  };
  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isCashier,
    login,
    logout,
    fetchCurrentUser,
    updateUser,
    initAuth,
  };
}
