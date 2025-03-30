<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Create New Electricity Bill</h2>
        <button @click="$router.back()" class="btn-secondary flex items-center">
          <i class="pi pi-arrow-left mr-2"></i> Back
        </button>
      </div>
      
      <div class="card max-w-3xl mx-auto">
        <form @submit.prevent="createBill">
          <div class="space-y-5">
            <!-- Customer Selection -->
            <div>
              <label for="customer" class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select 
                id="customer" 
                v-model="form.customer" 
                class="form-input"
                required
                @change="loadCustomerDetails"
              >
                <option value="" disabled>Select a customer</option>
                <option 
                  v-for="customer in electricityCustomers" 
                  :key="customer._id" 
                  :value="customer._id"
                >
                  {{ customer.name }} ({{ customer.location }})
                </option>
              </select>
            </div>
            
            <div v-if="form.customer" class="bg-gray-50 p-4 rounded">
              <h3 class="font-medium text-gray-700 mb-2">Customer Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">{{ selectedCustomer?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Previous Meter Reading</p>
                  <p class="font-medium">{{ selectedCustomer?.currentCounterValue || 0 }}</p>
                </div>
              </div>
            </div>
            
            <!-- Billing Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="currentReading" class="block text-sm font-medium text-gray-700 mb-1">Current Meter Reading</label>
                <input 
                  id="currentReading" 
                  v-model.number="form.currentReading" 
                  type="number" 
                  min="0"
                  step="1"
                  required
                  class="form-input"
                  @input="calculateBill"
                />
              </div>
              
              <div>
                <label for="consumption" class="block text-sm font-medium text-gray-700 mb-1">Consumption Units</label>
                <input 
                  id="consumption" 
                  :value="consumptionUnits" 
                  type="number" 
                  disabled
                  class="form-input bg-gray-100"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="billingMonth" class="block text-sm font-medium text-gray-700 mb-1">Billing Month</label>
                <input 
                  id="billingMonth" 
                  v-model="form.billingMonth" 
                  type="month"
                  required
                  class="form-input"
                />
              </div>
              
              <div>
                <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  id="dueDate" 
                  v-model="form.dueDate" 
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="ratePerUnit" class="block text-sm font-medium text-gray-700 mb-1">Rate Per Unit ($)</label>
                <input 
                  id="ratePerUnit" 
                  v-model.number="form.ratePerUnit" 
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="form-input"
                  @input="calculateBill"
                />
              </div>
              
              <div>
                <label for="billAmount" class="block text-sm font-medium text-gray-700 mb-1">Bill Amount ($)</label>
                <input 
                  id="billAmount" 
                  :value="billAmount.toFixed(2)" 
                  type="text"
                  disabled
                  class="form-input bg-gray-100"
                />
              </div>
            </div>
            
            <!-- Error message -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ error }}
            </div>
            
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button 
                type="submit" 
                :disabled="saving || !form.customer || consumptionUnits < 0" 
                class="btn"
              >
                <span v-if="saving"><i class="pi pi-spin pi-spinner mr-2"></i> Creating...</span>
                <span v-else>Create Bill</span>
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
  const selectedCustomer = ref(null)
  const electricityRate = ref(0)
  
  // Pre-select customer if provided in query params
  const preSelectedCustomerId = route.query.customerId
  
  // Initialize form with default values
  const form = ref({
    customer: preSelectedCustomerId || '',
    currentReading: 0,
    billingMonth: formatDateForMonthInput(new Date()),
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 15) // Default due date: 15 days from today
      return formatDateForInput(date)
    })(),
    ratePerUnit: 0
  })
  
  // Computed values
  const consumptionUnits = computed(() => {
    if (!selectedCustomer.value || form.value.currentReading < selectedCustomer.value.currentCounterValue) {
      return 0
    }
    return form.value.currentReading - selectedCustomer.value.currentCounterValue
  })
  
  const billAmount = computed(() => {
    return consumptionUnits.value * form.value.ratePerUnit
  })
  
  // Computed list of customers with electricity service
  const electricityCustomers = computed(() => {
    return customers.value.filter(customer => customer.hasElectricityService)
  })
  
  async function fetchCustomers() {
    try {
      const response = await axios.get('/customers')
      
      if (response.data.success) {
        customers.value = response.data.data
        
        // If customer ID was provided in query params, load their details
        if (preSelectedCustomerId) {
          loadCustomerDetails()
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }
  
  async function fetchElectricityRate() {
    try {
      const response = await axios.get('/admin/electricity-price')
      
      if (response.data.success) {
        electricityRate.value = response.data.data.ratePerUnit
        form.value.ratePerUnit = electricityRate.value
      }
    } catch (error) {
      console.error('Error fetching electricity rate:', error)
    }
  }
  
  function loadCustomerDetails() {
    if (!form.value.customer) {
      selectedCustomer.value = null
      return
    }
    
    const customer = customers.value.find(c => c._id === form.value.customer)
    selectedCustomer.value = customer
    
    // Reset current reading if it's less than the customer's current counter value
    if (form.value.currentReading < customer.currentCounterValue) {
      form.value.currentReading = customer.currentCounterValue
    }
    
    calculateBill()
  }
  
  function calculateBill() {
    // Validation is handled by computed properties
  }
  
  async function createBill() {
    if (consumptionUnits.value <= 0) {
      error.value = "Current reading must be greater than the previous reading"
      return
    }
    
    try {
      saving.value = true
      error.value = ''
      
      // Prepare billing month (first day of the selected month)
      const [year, month] = form.value.billingMonth.split('-')
      const billingMonth = new Date(year, parseInt(month) - 1, 1)
      
      const billData = {
        customer: form.value.customer,
        currentReading: form.value.currentReading,
        billingMonth: billingMonth.toISOString(),
        dueDate: new Date(form.value.dueDate).toISOString()
      }
      
      const response = await axios.post('/electricity', billData)
      
      if (response.data.success) {
        // Navigate to the bill detail page or bills list
        router.push('/electricity/bills')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create bill. Please try again.'
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
  
  function formatDateForMonthInput(date) {
    if (!date) return ''
    
    // Format as YYYY-MM for input[type="month"]
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${year}-${month}`
  }
  
  onMounted(() => {
    fetchCustomers()
    fetchElectricityRate()
  })
  </script>