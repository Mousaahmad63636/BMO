<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">WiFi Subscriptions</h2>
        <button @click="$router.push({ name: 'wifi-subscriptions-new' })" class="btn flex items-center">
          <i class="pi pi-plus mr-2"></i> Create New Subscription
        </button>
      </div>
      
      <!-- Search and Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="col-span-1">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Search by customer name..." 
            class="form-input"
            @input="handleSearch"
          />
        </div>
        <div class="col-span-1">
          <select v-model="statusFilter" class="form-input" @change="applyFilters">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-span-1">
          <select v-model="paymentFilter" class="form-input" @change="applyFilters">
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      
      <!-- Subscriptions Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="py-20 text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
          <p class="mt-2 text-gray-500">Loading subscriptions...</p>
        </div>
        
        <div v-else-if="filteredSubscriptions.length === 0" class="py-20 text-center">
          <i class="pi pi-wifi text-3xl text-gray-300"></i>
          <p class="mt-2 text-gray-500">No subscriptions found</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="subscription in filteredSubscriptions" :key="subscription._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">
                  {{ subscription.customer?.name || 'Unknown Customer' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-500">{{ subscription.plan?.name || 'Unknown Plan' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs text-gray-500">
                  <div>From: {{ formatDate(subscription.startDate) }}</div>
                  <div>To: {{ formatDate(subscription.endDate) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                ${{ subscription.billAmount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : subscription.status === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'"
                >
                  {{ subscription.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="subscription.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : subscription.paymentStatus === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ subscription.paymentStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  v-if="subscription.paymentStatus === 'unpaid' || subscription.paymentStatus === 'overdue'"
                  @click="markAsPaid(subscription._id)" 
                  class="text-green-600 hover:text-green-900 mr-2"
                >
                  Pay
                </button>
                <button 
                  v-if="subscription.status === 'active'"
                  @click="renewSubscription(subscription._id)" 
                  class="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Renew
                </button>
                <button @click="viewSubscription(subscription._id)" class="text-primary-600 hover:text-primary-900">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from '@/services/axios'
  
  const router = useRouter()
  const subscriptions = ref([])
  const loading = ref(true)
  const searchTerm = ref('')
  const statusFilter = ref('all')
  const paymentFilter = ref('all')
  
  // Filtered subscriptions based on search and filters
  const filteredSubscriptions = computed(() => {
    let result = subscriptions.value
  
    // Apply search
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      result = result.filter(subscription => 
        subscription.customer?.name?.toLowerCase().includes(term)
      )
    }
  
    // Apply status filter
    if (statusFilter.value !== 'all') {
      result = result.filter(subscription => subscription.status === statusFilter.value)
    }
    
    // Apply payment filter
    if (paymentFilter.value !== 'all') {
      result = result.filter(subscription => subscription.paymentStatus === paymentFilter.value)
    }
  
    // Sort by start date (newest first)
    result = [...result].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  
    return result
  })
  
  async function fetchSubscriptions() {
    try {
      loading.value = true
      const response = await axios.get('/wifi')
      
      if (response.data.success) {
        subscriptions.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching WiFi subscriptions:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function markAsPaid(subscriptionId) {
    try {
      const response = await axios.put(`/wifi/${subscriptionId}/pay`)
      
      if (response.data.success) {
        // Update subscription in list
        const index = subscriptions.value.findIndex(subscription => subscription._id === subscriptionId)
        if (index !== -1) {
          subscriptions.value[index] = response.data.data
        }
      }
    } catch (error) {
      console.error('Error marking subscription as paid:', error)
      alert('Failed to mark subscription as paid. Please try again.')
    }
  }
  
  async function renewSubscription(subscriptionId) {
    try {
      const response = await axios.post(`/wifi/${subscriptionId}/renew`)
      
      if (response.data.success) {
        // Add new subscription to list
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Error renewing subscription:', error)
      alert('Failed to renew subscription. Please try again.')
    }
  }
  
  function viewSubscription(subscriptionId) {
    router.push(`/wifi/subscriptions/${subscriptionId}`)
  }
  
  // Debounced search
  let searchTimeout
  function handleSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      // The computed property will handle the filtering
    }, 300)
  }
  
  // Apply filters
  function applyFilters() {
    // The computed property will handle the filtering
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    
    // Simple formatting
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    
    return `${month}/${day}/${year}`
  }
  
  onMounted(() => {
    fetchSubscriptions()
  })
  </script>