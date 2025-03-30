<template>
    <div class="max-w-lg mx-auto card">
      <h2 class="text-xl font-medium text-gray-800 mb-6">Electricity Price Settings</h2>
      
      <div v-if="loading" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
      </div>
      
      <div v-else>
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div>
            <label for="ratePerUnit" class="block text-sm font-medium text-gray-700 mb-1">
              Rate Per Unit ($/kWh)
            </label>
            <input
              id="ratePerUnit"
              v-model.number="form.ratePerUnit"
              type="number"
              step="0.01"
              min="0"
              required
              class="form-input"
            />
          </div>
          
          <div class="pt-2">
            <button
              type="submit"
              :disabled="saving"
              class="btn w-full flex justify-center"
            >
              <span v-if="saving">
                <i class="pi pi-spin pi-spinner mr-2"></i> Saving...
              </span>
              <span v-else>Save Settings</span>
            </button>
          </div>
          
          <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {{ successMessage }}
          </div>
          
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ error }}
          </div>
        </form>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Current Settings</h3>
          <div class="bg-gray-50 p-4 rounded">
            <div class="flex justify-between">
              <span class="text-gray-600">Current Rate:</span>
              <span class="font-medium">${{ settings.ratePerUnit }} per kWh</span>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-gray-600">Last Updated:</span>
              <span class="font-medium">{{ formatDate(settings.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import axios from '@/services/axios'
  
  const loading = ref(true)
  const saving = ref(false)
  const successMessage = ref('')
  const error = ref('')
  const settings = ref({
    ratePerUnit: 0,
    updatedAt: null
  })
  
  const form = reactive({
    ratePerUnit: 0
  })
  
  async function fetchSettings() {
    try {
      loading.value = true
      const response = await axios.get('/admin/electricity-price')
      if (response.data.success) {
        settings.value = response.data.data
        form.ratePerUnit = response.data.data.ratePerUnit
      }
    } catch (error) {
      console.error('Error fetching electricity price:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function saveSettings() {
    try {
      saving.value = true
      error.value = ''
      successMessage.value = ''
      
      const response = await axios.put('/admin/electricity-price', {
        ratePerUnit: form.ratePerUnit
      })
      
      if (response.data.success) {
        settings.value = response.data.data
        successMessage.value = 'Electricity price settings updated successfully'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update electricity price settings'
    } finally {
      saving.value = false
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
  
  onMounted(() => {
    fetchSettings()
  })
  </script>