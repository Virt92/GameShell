import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    user.value = data.user
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
  }

  const loadUser = () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        user.value = {
          id: payload.sub,
          clubId: payload.clubId,
          role: payload.role,
          name: '',
          email: '',
          clubName: '',
        }
      } catch {
        logout()
      }
    }
  }

  return { user, isAuthenticated, login, logout, loadUser }
})
