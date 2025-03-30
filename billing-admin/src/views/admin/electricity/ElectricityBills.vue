<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Electricity Bills</h2>
        <button @click="$router.push({ name: 'electricity-bills-new' })" class="btn flex items-center">
          <i class="pi pi-plus mr-2"></i> Create New Bill
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
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div class="col-span-1">
          <select v-model="sortBy" class="form-input" @change="applyFilters">
            <option value="billingMonth">Sort by Billing Month</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>
      
      <!-- Bills Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="py-20 text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
          <p class="mt-2 text-gray-500">Loading bills...</p>
        </div>
        
        <div v-else-if="filteredBills.length === 0" class="py-20 text-center">
          <i class="pi pi-file text-3xl text-gray-300"></i>
          <p class="mt-2 text-gray-500">No bills found</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Month</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="bill in filteredBills" :key="bill._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">
                  {{ bill.customer?.name || 'Unknown Customer' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(bill.billingMonth, 'MMM YYYY') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ bill.consumptionUnits }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                ${{ bill.ratePerUnit.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                ${{ bill.billAmount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="bill.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : bill.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
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
                  v-if="bill.status === 'unpaid' || bill.status === 'overdue'"
                  @click="markAsPaid(bill._id)" 
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Mark as Paid
                </button>
                <button @click="viewBill(bill._id)" class="text-primary-600 hover:text-primary-900 mr-3">
                  View
                </button>
                <button @click="editBill(bill)" class="text-indigo-600 hover:text-indigo-900">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Edit Bill Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Electricity Bill</h3>
          
          <form @submit.prevent="updateBill">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Customer</label>
                <input type="text" :value="editingBill.customerName" disabled class="form-input mt-1 bg-gray-100" />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="edit-previous" class="block text-sm font-medium text-gray-700">Previous Reading</label>
                  <input id="edit-previous" v-model.number="editingBill.previousReading" type="number" min="0" class="form-input mt-1" />
                </div>
                
                <div>
                  <label for="edit-current" class="block text-sm font-medium text-gray-700">Current Reading</label>
                  <input id="edit-current" v-model.number="editingBill.currentReading" type="number" min="0" class="form-input mt-1" />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="edit-rate" class="block text-sm font-medium text-gray-700">Rate Per Unit</label>
                  <input id="edit-rate" v-model.number="editingBill.ratePerUnit" type="number" step="0.01" min="0" class="form-input mt-1" />
                </div>
                
                <div>
                  <label for="edit-units" class="block text-sm font-medium text-gray-700">Consumption Units</label>
                  <input id="edit-units" :value="consumptionUnits" disabled class="form-input mt-1 bg-gray-100" />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="edit-month" class="block text-sm font-medium text-gray-700">Billing Month</label>
                  <input id="edit-month" v-model="editingBill.billingMonth" type="date" class="form-input mt-1" />
                </div>
                
                <div>
                  <label for="edit-due" class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input id="edit-due" v-model="editingBill.dueDate" type="date" class="form-input mt-1" />
                </div>
              </div>
              
              <div>
                <label for="edit-amount" class="block text-sm font-medium text-gray-700">Bill Amount</label>
                <input id="edit-amount" :value="'$' + billAmount.toFixed(2)" disabled class="form-input mt-1 bg-gray-100" />
              </div>
              
              <div>
                <label for="edit-status" class="block text-sm font-medium text-gray-700">Status</label>
                <select id="edit-status" v-model="editingBill.status" class="form-input mt-1">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
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
                <span v-else>Update Bill</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from '@/services/axios'
  
  const router = useRouter()
  const bills = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const searchTerm = ref('')
  const statusFilter = ref('all')
  const sortBy = ref('billingMonth')
  const showEditModal = ref(false)
  const editingBill = ref({})
  
  // Computed values for the edit form
  const consumptionUnits = computed(() => {
    if (!editingBill.value.currentReading || !editingBill.value.previousReading) return 0
    return editingBill.value.currentReading - editingBill.value.previousReading
  })
  
  const billAmount = computed(() => {
    return consumptionUnits.value * editingBill.value.ratePerUnit
  })
  
  // Filtered bills based on search and filters
  const filteredBills = computed(() => {
    let result = bills.value
  
    // Apply search
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      result = result.filter(bill => 
        bill.customer?.name?.toLowerCase().includes(term)
      )
    }
  
    // Apply status filter
    if (statusFilter.value !== 'all') {
      result = result.filter(bill => bill.status === statusFilter.value)
    }
  
    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy.value === 'billingMonth') {
        return new Date(b.billingMonth) - new Date(a.billingMonth)
      } else if (sortBy.value === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate)
      } else if (sortBy.value === 'amount') {
        return b.billAmount - a.billAmount
      }
      return 0
    })
  
    return result
  })
  
  async function fetchBills() {
    try {
      loading.value = true
      const response = await axios.get('/electricity')
      
      if (response.data.success) {
        bills.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching electricity bills:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function markAsPaid(billId) {
    try {
      const response = await axios.put(`/electricity/${billId}/pay`)
      
      if (response.data.success) {
        // Update bill in list
        const index = bills.value.findIndex(bill => bill._id === billId)
        if (index !== -1) {
          bills.value[index] = response.data.data
        }
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error)
      alert('Failed to mark bill as paid. Please try again.')
    }
  }
  
  function viewBill(billId) {
    router.push(`/electricity/bills/${billId}`)
  }
  
  function editBill(bill) {
    // Create a copy to avoid direct modification
    editingBill.value = {
      _id: bill._id,
      customerName: bill.customer?.name || 'Unknown Customer',
      previousReading: bill.previousReading,
      currentReading: bill.currentReading,
      ratePerUnit: bill.ratePerUnit,
      billingMonth: formatDateForInput(bill.billingMonth),
      dueDate: formatDateForInput(bill.dueDate),
      status: bill.status
    }
    
    showEditModal.value = true
  }
  
  async function updateBill() {
    try {
      saving.value = true
      
      const billData = {
        previousReading: editingBill.value.previousReading,
        currentReading: editingBill.value.currentReading,
        ratePerUnit: editingBill.value.ratePerUnit,
        billingMonth: editingBill.value.billingMonth,
        dueDate: editingBill.value.dueDate,
        status: editingBill.value.status
      }
      
      const response = await axios.put(`/electricity/${editingBill.value._id}`, billData)
      
      if (response.data.success) {
        // Update bill in list
        const index = bills.value.findIndex(bill => bill._id === editingBill.value._id)
        if (index !== -1) {
          bills.value[index] = response.data.data
        }
        
        showEditModal.value = false
      }
    } catch (error) {
      console.error('Error updating electricity bill:', error)
      alert('Failed to update electricity bill. Please try again.')
    } finally {
      saving.value = false
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
  
  function formatDateForInput(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    
    // Format as YYYY-MM-DD for input[type="date"]
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${year}-${month}-${day}`
  }
  
  onMounted(() => {
    fetchBills()
  })
  </script>