<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Customers</h2>
        <button @click="showAddCustomerModal = true" class="btn flex items-center">
          <i class="pi pi-plus mr-2"></i> Add Customer
        </button>
      </div>
      
      <!-- Search and Filters -->
      <div class="flex space-x-4">
        <div class="flex-1">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Search customers..." 
            class="form-input"
            @input="handleSearch"
          />
        </div>
        <div>
          <select v-model="filterService" class="form-input" @change="applyFilters">
            <option value="all">All Services</option>
            <option value="electricity">Electricity Only</option>
            <option value="wifi">WiFi Only</option>
            <option value="both">Both Services</option>
          </select>
        </div>
      </div>
      
      <!-- Customers Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="py-20 text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
          <p class="mt-2 text-gray-500">Loading customers...</p>
        </div>
        
        <div v-else-if="filteredCustomers.length === 0" class="py-20 text-center">
          <i class="pi pi-users text-3xl text-gray-300"></i>
          <p class="mt-2 text-gray-500">No customers found</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counter</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in filteredCustomers" :key="customer._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ customer.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-500">{{ customer.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-500">{{ customer.location }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <span v-if="customer.hasElectricityService" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Electricity
                  </span>
                  <span v-if="customer.hasWifiService" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    WiFi
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-500">{{ customer.currentCounterValue }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link :to="`/customers/${customer._id}`" class="text-primary-600 hover:text-primary-900 mr-3">
                  View
                </router-link>
                <button @click="editCustomer(customer)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                  Edit
                </button>
                <button @click="confirmDelete(customer)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Add Customer Modal -->
      <div v-if="showAddCustomerModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
          
          <form @submit.prevent="addCustomer">
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" v-model="newCustomer.name" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input id="phone" v-model="newCustomer.phone" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                <input id="location" v-model="newCustomer.location" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="initialCounter" class="block text-sm font-medium text-gray-700">Initial Counter Value</label>
                <input id="initialCounter" v-model.number="newCustomer.initialCounterValue" type="number" min="0" class="form-input mt-1" />
              </div>
              
              <div class="flex space-x-4">
                <div class="flex items-center">
                  <input id="hasElectricity" v-model="newCustomer.hasElectricityService" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label for="hasElectricity" class="ml-2 block text-sm text-gray-700">Electricity Service</label>
                </div>
                
                <div class="flex items-center">
                  <input id="hasWifi" v-model="newCustomer.hasWifiService" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label for="hasWifi" class="ml-2 block text-sm text-gray-700">WiFi Service</label>
                </div>
              </div>
            </div>
            
            <div class="mt-5 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showAddCustomerModal = false" 
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
                <span v-else>Save Customer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Edit Customer Modal -->
      <div v-if="showEditCustomerModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
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
                @click="showEditCustomerModal = false" 
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
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete the customer "{{ customerToDelete?.name }}"? This action cannot be undone.
          </p>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              @click="deleteCustomer" 
              :disabled="deleting" 
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              <span v-if="deleting"><i class="pi pi-spin pi-spinner mr-2"></i> Deleting...</span>
              <span v-else>Delete Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import axios from '@/services/axios'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const customers = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const deleting = ref(false)
  const searchTerm = ref('')
  const filterService = ref('all')
  
  // Modal states
  const showAddCustomerModal = ref(false)
  const showEditCustomerModal = ref(false)
  const showDeleteModal = ref(false)
  const customerToDelete = ref(null)
  const editingCustomer = ref({})
  
  // New customer form
  const newCustomer = ref({
    name: '',
    phone: '',
    location: '',
    initialCounterValue: 0,
    hasElectricityService: true,
    hasWifiService: false
  })
  
  // Filtered customers based on search and filters
  const filteredCustomers = computed(() => {
    let result = customers.value
  
    // Apply search
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(term) || 
        customer.phone.toLowerCase().includes(term) || 
        customer.location.toLowerCase().includes(term)
      )
    }
  
    // Apply service filter
    if (filterService.value !== 'all') {
      if (filterService.value === 'electricity') {
        result = result.filter(customer => customer.hasElectricityService && !customer.hasWifiService)
      } else if (filterService.value === 'wifi') {
        result = result.filter(customer => customer.hasWifiService && !customer.hasElectricityService)
      } else if (filterService.value === 'both') {
        result = result.filter(customer => customer.hasElectricityService && customer.hasWifiService)
      }
    }
  
    return result
  })
  
  // Fetch all customers
  async function fetchCustomers() {
    try {
      loading.value = true
      const response = await axios.get('/customers')
      if (response.data.success) {
        customers.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Add a new customer
  async function addCustomer() {
    try {
      saving.value = true
      const response = await axios.post('/customers', newCustomer.value)
      
      if (response.data.success) {
        // Add new customer to list
        customers.value.unshift(response.data.data)
        
        // Reset form and close modal
        newCustomer.value = {
          name: '',
          phone: '',
          location: '',
          initialCounterValue: 0,
          hasElectricityService: true,
          hasWifiService: false
        }
        showAddCustomerModal.value = false
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('Failed to add customer. Please try again.')
    } finally {
      saving.value = false
    }
  }
  
  // Edit customer
  function editCustomer(customer) {
    editingCustomer.value = { ...customer }
    showEditCustomerModal.value = true
  }
  
  // Update customer
  async function updateCustomer() {
    try {
      saving.value = true
      const response = await axios.put(`/customers/${editingCustomer.value._id}`, editingCustomer.value)
      
      if (response.data.success) {
        // Update customer in list
        const index = customers.value.findIndex(c => c._id === editingCustomer.value._id)
        if (index !== -1) {
          customers.value[index] = response.data.data
        }
        
        // Close modal
        showEditCustomerModal.value = false
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer. Please try again.')
    } finally {
      saving.value = false
    }
  }
  
  // Confirm delete
  function confirmDelete(customer) {
    customerToDelete.value = customer
    showDeleteModal.value = true
  }
  
  // Delete customer
  async function deleteCustomer() {
    try {
      if (!customerToDelete.value) return
      
      deleting.value = true
      const response = await axios.delete(`/customers/${customerToDelete.value._id}`)
      
      if (response.data.success) {
        // Remove from list
        customers.value = customers.value.filter(c => c._id !== customerToDelete.value._id)
        
        // Close modal
        showDeleteModal.value = false
        customerToDelete.value = null
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer. Please try again.')
    } finally {
      deleting.value = false
    }
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
  
  onMounted(() => {
    fetchCustomers()
  })
  </script>