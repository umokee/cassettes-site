import { defineStore } from 'pinia'
import authAPI from '@/api/auth'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isCashier: (state) => state.user?.role === 'cashier'
  },
  actions: {
    async login(credentials) {
      try {
        const { data } = await authAPI.login(credentials)
        this.token = data.token
        this.user = data.employee
        this.isAuthenticated = true
        localStorage.setItem('token', data.token)
        return data
      } catch (error) {
        throw error
      }
    },
    async fetchProfile() {
      try {
        const { data } = await authAPI.getProfile()
        this.user = data
        return data
      } catch (error) {
        this.logout()
        throw error
      }
    },
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
    },
    async logout() {
      try {
        await authAPI.logout()
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
      }
    }
  }
})
