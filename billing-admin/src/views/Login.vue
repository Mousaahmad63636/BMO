<template>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ error }}
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="form-input"
              />
            </div>
          </div>
  
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="form-input"
              />
            </div>
          </div>
  
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="btn w-full flex justify-center"
            >
              <span v-if="loading">
                <i class="pi pi-spin pi-spinner mr-2"></i> Logging in...
              </span>
              <span v-else>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref('')
  
  const form = reactive({
    email: '',
    password: ''
  })
  
  async function handleSubmit() {
    loading.value = true
    error.value = ''
    
    try {
      const result = await authStore.login(form)
      if (!result.success) {
        error.value = result.message
      }
    } catch (err) {
      error.value = 'An unexpected error occurred'
    } finally {
      loading.value = false
    }
  }
  </script>