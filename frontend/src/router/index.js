import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('@/views/clients/ClientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rentals',
    name: 'rentals',
    component: () => import('@/views/rentals/RentalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/movies',
    name: 'movies',
    component: () => import('@/views/movies/MoviesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cassettes',
    name: 'cassettes',
    component: () => import('@/views/cassettes/CassettesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/genres',
    name: 'genres',
    component: () => import('@/views/genres/GenresView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/tariffs',
    name: 'tariffs',
    component: () => import('@/views/tariffs/TariffsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'employees',
    component: () => import('@/views/employees/EmployeesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/auth/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})
export default router
