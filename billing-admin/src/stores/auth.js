import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/services/axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    try {
      const response = await axios.post('/auth/login', credentials)
      
      if (response.data.success) {
        user.value = response.data.user
        token.value = response.data.token
        
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
        router.push({ name: 'dashboard' })
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push({ name: 'login' })
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout
  }
})