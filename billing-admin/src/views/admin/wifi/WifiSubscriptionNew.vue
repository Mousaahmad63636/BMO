<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Create New WiFi Subscription</h2>
        <button @click="$router.back()" class="btn-secondary flex items-center">
          <i class="pi pi-arrow-left mr-2"></i> Back
        </button>
      </div>
      
      <div class="card max-w-3xl mx-auto">
        <form @submit.prevent="createSubscription">
          <div class="space-y-5">
            <!-- Customer Selection -->
            <div>
              <label for="customer" class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select 
                id="customer" 
                v-model="form.customer" 
                class="form-input"
                required
              >
                <option value="" disabled>Select a customer</option>
                <option 
                  v-for="customer in customers" 
                  :key="customer._id" 
                  :value="customer._id"
                >
                  {{ customer.name }} ({{ customer.location }})
                </option>
              </select>
            </div>
            
            <!-- Plan Selection -->
            <div>
              <label for="plan" class="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
              <select 
                id="plan" 
                v-model="form.plan" 
                class="form-input"
                required
                @change="updateDetails"
              >
                <option value="" disabled>Select a plan</option>
                <option 
                  v-for="plan in plans" 
                  :key="plan._id" 
                  :value="plan._id"
                >
                  {{ plan.name }} - ${{ plan.price }} for {{ plan.durationDays }} days
                </option>
              </select>
            </div>
            
            <!-- Selected Plan Details -->
            <div v-if="selectedPlan" class="bg-gray-50 p-4 rounded">
              <h3 class="font-medium text-gray-700 mb-2">Plan Details</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">{{ selectedPlan.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Price</p>
                  <p class="font-medium">${{ selectedPlan.price }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Duration</p>
                  <p class="font-medium">{{ selectedPlan.durationDays }} days</p>
                </div>
              </div>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Features</p>
                <ul class="mt-1 space-y-1">
                  <li v-for="(feature, index) in selectedPlan.features" :key="index" class="flex items-start">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    <span class="text-gray-600">{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Date Range -->
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                id="startDate" 
                v-model="form.startDate" 
                type="date"
                required
                class="form-input"
                @change="updateEndDate"
              />
            </div>
            
            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                id="endDate" 
                :value="endDate" 
                type="date"
                disabled
                class="form-input bg-gray-100"
              />
            </div>
            
            <!-- Error message -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ error }}
            </div>
            
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button 
                type="submit" 
                :disabled="saving || !form.customer || !form.plan || !form.startDate" 
                class="btn"
              >
                <span v-if="saving"><i class="pi pi-spin pi-spinner mr-2"></i> Creating...</span>
                <span v-else>Create Subscription</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from '@/services/axios'
  
  const route = useRoute()
  const router = useRouter()
  const saving = ref(false)
  const error = ref('')
  const customers = ref([])
  const plans = ref([])
  const selectedPlan = ref(null)
  
  // Pre-select customer if provided in query params
  const preSelectedCustomerId = route.query.customerId
  
  // Initialize form with default values
  const form = ref({
    customer: preSelectedCustomerId || '',
    plan: '',
    startDate: formatDateForInput(new Date())
  })
  
  // Computed end date based on selected plan and start date
  const endDate = computed(() => {
    if (!form.value.startDate || !selectedPlan.value) return ''
    
    const startDate = new Date(form.value.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + selectedPlan.value.durationDays)
    
    return formatDateForInput(endDate)
  })
  
  async function fetchCustomers() {
    try {
      const response = await axios.get('/customers')
      
      if (response.data.success) {
        customers.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }
  
  async function fetchPlans() {
    try {
      const response = await axios.get('/wifi/plans')
      
      if (response.data.success) {
        plans.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching WiFi plans:', error)
    }
  }
  
  function updateDetails() {
    if (!form.value.plan) {
      selectedPlan.value = null
      return
    }
    
    selectedPlan.value = plans.value.find(p => p._id === form.value.plan)
    updateEndDate()
  }
  
  function updateEndDate() {
    // The computed property handles this
  }
  
  async function createSubscription() {
    try {
      saving.value = true
      error.value = ''
      
      const subscriptionData = {
        customer: form.value.customer,
        plan: form.value.plan,
        startDate: new Date(form.value.startDate).toISOString()
      }
      
      const response = await axios.post('/wifi', subscriptionData)
      
      if (response.data.success) {
        // Navigate to the subscriptions list
        router.push('/wifi/subscriptions')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create subscription. Please try again.'
    } finally {
      saving.value = false
    }
  }
  
  function formatDateForInput(date) {
    if (!date) return ''
    
    // Format as YYYY-MM-DD for input[type="date"]
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${year}-${month}-${day}`
  }
  
  onMounted(() => {
    fetchCustomers()
    fetchPlans()
  })
  </script>