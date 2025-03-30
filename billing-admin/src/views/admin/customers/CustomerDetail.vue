<template>
    <div class="space-y-6">
      <!-- Back Button -->
      <div>
        <button @click="$router.back()" class="flex items-center text-gray-600 hover:text-gray-900">
          <i class="pi pi-arrow-left mr-2"></i> Back to Customers
        </button>
      </div>
      
      <div v-if="loading" class="py-20 text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        <p class="mt-2 text-gray-500">Loading customer details...</p>
      </div>
      
      <div v-else-if="!customer._id" class="py-20 text-center">
        <p class="text-gray-500">Customer not found</p>
      </div>
      
      <div v-else>
        <!-- Customer Details -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Customer Information Card -->
          <div class="lg:col-span-1 card">
            <div class="flex justify-between items-start">
              <h2 class="text-xl font-semibold text-gray-800">Customer Information</h2>
              <button @click="editCustomer" class="text-primary-600 hover:text-primary-800">
                <i class="pi pi-pencil"></i>
              </button>
            </div>
            
            <div class="mt-4 space-y-3">
              <div>
                <p class="text-sm text-gray-500">Name</p>
                <p class="font-medium">{{ customer.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Phone</p>
                <p class="font-medium">{{ customer.phone }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Location</p>
                <p class="font-medium">{{ customer.location }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Services</p>
                <div class="flex space-x-2 mt-1">
                  <span v-if="customer.hasElectricityService" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Electricity
                  </span>
                  <span v-if="customer.hasWifiService" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    WiFi
                  </span>
                </div>
              </div>
              <div v-if="customer.hasElectricityService">
                <p class="text-sm text-gray-500">Current Counter Value</p>
                <p class="font-medium">{{ customer.currentCounterValue }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Added On</p>
                <p class="font-medium">{{ formatDate(customer.createdAt) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Actions Panel -->
          <div class="lg:col-span-2 card">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="customer.hasElectricityService" class="card bg-blue-50">
                <h3 class="text-lg font-medium text-blue-800 mb-3">Electricity</h3>
                <div class="space-y-3">
                  <button @click="navigateTo('createElectricityBill')" class="btn w-full">
                    Create New Bill
                  </button>
                  <button @click="navigateTo('viewElectricityBills')" class="btn-secondary w-full">
                    View All Bills
                  </button>
                </div>
              </div>
              
              <div v-if="customer.hasWifiService" class="card bg-green-50">
                <h3 class="text-lg font-medium text-green-800 mb-3">WiFi</h3>
                <div class="space-y-3">
                  <button @click="navigateTo('createWifiSubscription')" class="btn w-full">
                    Create New Subscription
                  </button>
                  <button @click="navigateTo('viewWifiSubscriptions')" class="btn-secondary w-full">
                    View All Subscriptions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tabs for Bills and Subscriptions -->
        <div class="mt-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex">
              <button 
                @click="activeTab = 'bills'"
                class="py-4 px-6 font-medium text-sm border-b-2 focus:outline-none"
                :class="activeTab === 'bills' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Electricity Bills
              </button>
              <button 
                @click="activeTab = 'subscriptions'"
                class="py-4 px-6 font-medium text-sm border-b-2 focus:outline-none"
                :class="activeTab === 'subscriptions' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                WiFi Subscriptions
              </button>
            </nav>
          </div>
          
          <!-- Electricity Bills Tab -->
          <div v-if="activeTab === 'bills'" class="mt-6">
            <div v-if="loadingBills" class="py-10 text-center">
              <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
            </div>
            
            <div v-else-if="bills.length === 0" class="py-10 text-center">
              <p class="text-gray-500">No electricity bills found</p>
            </div>
            
            <div v-else>
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Month</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="bill in bills" :key="bill._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(bill.billingMonth, 'MMM YYYY') }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ bill.consumptionUnits }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${{ bill.billAmount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'"
                      >
                        {{ bill.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(bill.dueDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        v-if="bill.status === 'unpaid'"
                        @click="markBillAsPaid(bill._id)" 
                        class="text-green-600 hover:text-green-900 mr-3"
                      >
                        Mark as Paid
                      </button>
                      <button @click="viewBill(bill._id)" class="text-primary-600 hover:text-primary-900">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- WiFi Subscriptions Tab -->
          <div v-if="activeTab === 'subscriptions'" class="mt-6">
            <div v-if="loadingSubscriptions" class="py-10 text-center">
              <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
            </div>
            
            <div v-else-if="subscriptions.length === 0" class="py-10 text-center">
              <p class="text-gray-500">No WiFi subscriptions found</p>
            </div>
            
            <div v-else>
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="subscription in subscriptions" :key="subscription._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ subscription.plan?.name || 'Unknown Plan' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(subscription.startDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(subscription.endDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${{ subscription.billAmount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1"
                          :class="subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : subscription.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'"
                        >
                          {{ subscription.status }}
                        </span>
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="subscription.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'"
                        >
                          {{ subscription.paymentStatus }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        v-if="subscription.paymentStatus === 'unpaid'"
                        @click="markSubscriptionAsPaid(subscription._id)" 
                        class="text-green-600 hover:text-green-900 mr-3"
                      >
                        Mark as Paid
                      </button>
                      <button 
                        v-if="subscription.status === 'active'"
                        @click="renewSubscription(subscription._id)" 
                        class="text-blue-600 hover:text-blue-900 mr-3"
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
        </div>
      </div>
      
      <!-- Edit Customer Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Customer</h3>
          
          <form @submit.prevent="updateCustomer">
            <div class="space-y-4">
              <div>
                <label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
                <input id="edit-name" v-model="editingCustomer.name" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="edit-phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input id="edit-phone" v-model="editingCustomer.phone" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="edit-location" class="block text-sm font-medium text-gray-700">Location</label>
                <input id="edit-location" v-model="editingCustomer.location" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="edit-counter" class="block text-sm font-medium text-gray-700">Current Counter Value</label>
                <input id="edit-counter" v-model.number="editingCustomer.currentCounterValue" type="number" min="0" class="form-input mt-1" />
              </div>
              
              <div class="flex space-x-4">
                <div class="flex items-center">
                  <input id="edit-electricity" v-model="editingCustomer.hasElectricityService" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label for="edit-electricity" class="ml-2 block text-sm text-gray-700">Electricity Service</label>
                </div>
                
                <div class="flex items-center">
                  <input id="edit-wifi" v-model="editingCustomer.hasWifiService" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label for="edit-wifi" class="ml-2 block text-sm text-gray-700">WiFi Service</label>
                </div>
              </div>
            </div>
            
            <div class="mt-5 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showEditModal = false" 
                class="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="saving" 
                class="btn"
              >
                <span v-if="saving"><i class="pi pi-spin pi-spinner mr-2"></i> Saving...</span>
                <span v-else>Update Customer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from '@/services/axios'
  
  const route = useRoute()
  const router = useRouter()
  const customerId = route.params.id
  
  const customer = ref({})
  const bills = ref([])
  const subscriptions = ref([])
  const loading = ref(true)
  const loadingBills = ref(false)
  const loadingSubscriptions = ref(false)
  const saving = ref(false)
  const activeTab = ref('bills')
  const showEditModal = ref(false)
  const editingCustomer = ref({})
  
  async function fetchCustomer() {
    try {
      loading.value = true
      const response = await axios.get(`/customers/${customerId}`)
      
      if (response.data.success) {
        customer.value = response.data.data
        // Load bills if customer has electricity service
        if (customer.value.hasElectricityService) {
          fetchBills()
        }
        
        // Load subscriptions if customer has WiFi service
        if (customer.value.hasWifiService) {
          fetchSubscriptions()
        }
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchBills() {
    try {
      loadingBills.value = true
      const response = await axios.get(`/electricity/customer/${customerId}`)
      
      if (response.data.success) {
        bills.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching electricity bills:', error)
    } finally {
      loadingBills.value = false
    }
  }
  
  async function fetchSubscriptions() {
    try {
      loadingSubscriptions.value = true
      const response = await axios.get(`/wifi/customer/${customerId}`)
      
      if (response.data.success) {
        subscriptions.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching WiFi subscriptions:', error)
    } finally {
      loadingSubscriptions.value = false
    }
  }
  
  function editCustomer() {
    editingCustomer.value = { ...customer.value }
    showEditModal.value = true
  }
  
  async function updateCustomer() {
    try {
      saving.value = true
      const response = await axios.put(`/customers/${customerId}`, editingCustomer.value)
      
      if (response.data.success) {
        customer.value = response.data.data
        showEditModal.value = false
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer. Please try again.')
    } finally {
      saving.value = false
    }
  }
  
  async function markBillAsPaid(billId) {
    try {
      const response = await axios.put(`/electricity/${billId}/pay`)
      
      if (response.data.success) {
        // Update bill in list
        const index = bills.value.findIndex(b => b._id === billId)
        if (index !== -1) {
          bills.value[index] = response.data.data
        }
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error)
      alert('Failed to mark bill as paid. Please try again.')
    }
  }
  
  async function markSubscriptionAsPaid(subscriptionId) {
    try {
      const response = await axios.put(`/wifi/${subscriptionId}/pay`)
      
      if (response.data.success) {
        // Update subscription in list
        const index = subscriptions.value.findIndex(s => s._id === subscriptionId)
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
  
  function viewBill(billId) {
    router.push(`/electricity/bills/${billId}`)
  }
  
  function viewSubscription(subscriptionId) {
    router.push(`/wifi/subscriptions/${subscriptionId}`)
  }
  
  function navigateTo(action) {
    switch (action) {
      case 'createElectricityBill':
        router.push({ 
          name: 'electricity-bills-new', 
          query: { customerId } 
        })
        break
      case 'viewElectricityBills':
        activeTab.value = 'bills'
        break
      case 'createWifiSubscription':
        router.push({ 
          name: 'wifi-subscriptions-new', 
          query: { customerId } 
        })
        break
      case 'viewWifiSubscriptions':
        activeTab.value = 'subscriptions'
        break
    }
  }
  
  function formatDate(dateString, format = 'MM/DD/YYYY') {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    
    // Simple formatting
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    
    if (format === 'MMM YYYY') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[date.getMonth()]} ${year}`
    }
    
    return `${month}/${day}/${year}`
  }
  
  onMounted(() => {
    fetchCustomer()
  })
  </script>