<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">WiFi Plans</h2>
        <button @click="showAddPlanModal = true" class="btn flex items-center">
          <i class="pi pi-plus mr-2"></i> Add Plan
        </button>
      </div>
      
      <!-- Plans Grid -->
      <div v-if="loading" class="py-20 text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        <p class="mt-2 text-gray-500">Loading plans...</p>
      </div>
      
      <div v-else-if="plans.length === 0" class="py-20 text-center">
        <i class="pi pi-wifi text-3xl text-gray-300"></i>
        <p class="mt-2 text-gray-500">No subscription plans found</p>
        <button @click="showAddPlanModal = true" class="mt-4 btn">
          Create First Plan
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="plan in plans" :key="plan._id" class="bg-white rounded-lg shadow overflow-hidden">
          <div 
            class="p-6"
            :class="{ 'opacity-60': !plan.isActive }"
          >
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-bold text-gray-800">{{ plan.name }}</h3>
              <div>
                <span 
                  v-if="plan.isActive" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Active
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  Inactive
                </span>
              </div>
            </div>
            
            <div class="mt-4 flex items-baseline">
              <span class="text-3xl font-extrabold text-primary-600">${{ plan.price }}</span>
              <span class="ml-1 text-xl font-medium text-gray-500">/ {{ plan.durationDays }} days</span>
            </div>
            
            <p class="mt-3 text-gray-600">{{ plan.description }}</p>
            
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Features:</h4>
              <ul class="space-y-2">
                <li v-for="(feature, index) in plan.features" :key="index" class="flex items-start">
                  <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                  <span class="text-gray-600">{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <div class="mt-6 flex justify-between">
              <button @click="editPlan(plan)" class="text-primary-600 hover:text-primary-800">
                <i class="pi pi-pencil mr-1"></i> Edit
              </button>
              <button 
                v-if="plan.isActive"
                @click="confirmDeactivatePlan(plan)" 
                class="text-red-600 hover:text-red-800"
              >
                <i class="pi pi-times-circle mr-1"></i> Deactivate
              </button>
              <button 
                v-else
                @click="activatePlan(plan._id)" 
                class="text-green-600 hover:text-green-800"
              >
                <i class="pi pi-check-circle mr-1"></i> Activate
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add Plan Modal -->
      <div v-if="showAddPlanModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-screen overflow-y-auto">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New WiFi Plan</h3>
          
          <form @submit.prevent="addPlan">
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Plan Name</label>
                <input id="name" v-model="newPlan.name" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" v-model="newPlan.description" rows="3" required class="form-input mt-1"></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="price" class="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input id="price" v-model.number="newPlan.price" type="number" step="0.01" min="0" required class="form-input mt-1" />
                </div>
                
                <div>
                  <label for="duration" class="block text-sm font-medium text-gray-700">Duration (days)</label>
                  <input id="duration" v-model.number="newPlan.durationDays" type="number" min="1" required class="form-input mt-1" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div class="space-y-2">
                  <div 
                    v-for="(feature, index) in newPlan.features" 
                    :key="index"
                    class="flex items-center"
                  >
                    <input 
                      :id="`feature-${index}`" 
                      v-model="newPlan.features[index]" 
                      type="text" 
                      class="form-input flex-grow" 
                      placeholder="Enter feature"
                    />
                    <button 
                      type="button" 
                      @click="removeFeature(index)" 
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  
                  <button 
                    type="button" 
                    @click="addFeature" 
                    class="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <i class="pi pi-plus mr-1"></i> Add Feature
                  </button>
                </div>
              </div>
            </div>
            
            <div class="mt-5 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showAddPlanModal = false" 
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
                <span v-else>Save Plan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Edit Plan Modal -->
      <div v-if="showEditPlanModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-screen overflow-y-auto">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit WiFi Plan</h3>
          
          <form @submit.prevent="updatePlan">
            <div class="space-y-4">
              <div>
                <label for="edit-name" class="block text-sm font-medium text-gray-700">Plan Name</label>
                <input id="edit-name" v-model="editingPlan.name" type="text" required class="form-input mt-1" />
              </div>
              
              <div>
                <label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="edit-description" v-model="editingPlan.description" rows="3" required class="form-input mt-1"></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="edit-price" class="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input id="edit-price" v-model.number="editingPlan.price" type="number" step="0.01" min="0" required class="form-input mt-1" />
                </div>
                
                <div>
                  <label for="edit-duration" class="block text-sm font-medium text-gray-700">Duration (days)</label>
                  <input id="edit-duration" v-model.number="editingPlan.durationDays" type="number" min="1" required class="form-input mt-1" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div class="space-y-2">
                  <div 
                    v-for="(feature, index) in editingPlan.features" 
                    :key="index"
                    class="flex items-center"
                  >
                    <input 
                      :id="`edit-feature-${index}`" 
                      v-model="editingPlan.features[index]" 
                      type="text" 
                      class="form-input flex-grow" 
                      placeholder="Enter feature"
                    />
                    <button 
                      type="button" 
                      @click="removeEditingFeature(index)" 
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  
                  <button 
                    type="button" 
                    @click="addEditingFeature" 
                    class="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <i class="pi pi-plus mr-1"></i> Add Feature
                  </button>
                </div>
              </div>
              
              <div class="flex items-center">
                <input id="edit-active" v-model="editingPlan.isActive" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <label for="edit-active" class="ml-2 block text-sm text-gray-700">Plan is Active</label>
              </div>
            </div>
            
            <div class="mt-5 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showEditPlanModal = false" 
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
                <span v-else>Update Plan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Deactivation</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to deactivate the plan "{{ planToDelete?.name }}"? 
            This will make it unavailable for new subscriptions.
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
              @click="deactivatePlan" 
              :disabled="deleting" 
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              <span v-if="deleting"><i class="pi pi-spin pi-spinner mr-2"></i> Deactivating...</span>
              <span v-else>Deactivate Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from '@/services/axios'
  
  const plans = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const deleting = ref(false)
  
  // Modal states
  const showAddPlanModal = ref(false)
  const showEditPlanModal = ref(false)
  const showDeleteModal = ref(false)
  const planToDelete = ref(null)
  
  // New plan form
  const newPlan = ref({
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
    features: ['']
  })
  
  // Editing plan
  const editingPlan = ref({})
  
  async function fetchPlans() {
    try {
      loading.value = true
      const response = await axios.get('/wifi/plans')
      
      if (response.data.success) {
        plans.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching WiFi plans:', error)
    } finally {
      loading.value = false
    }
  }
  
  function addFeature() {
    newPlan.value.features.push('')
  }
  
  function removeFeature(index) {
    newPlan.value.features.splice(index, 1)
    
    // Ensure there's always at least one feature field
    if (newPlan.value.features.length === 0) {
      newPlan.value.features.push('')
    }
  }
  
  function addEditingFeature() {
    editingPlan.value.features.push('')
  }
  
  function removeEditingFeature(index) {
    editingPlan.value.features.splice(index, 1)
    
    // Ensure there's always at least one feature field
    if (editingPlan.value.features.length === 0) {
      editingPlan.value.features.push('')
    }
  }
  
  async function addPlan() {
    try {
      saving.value = true
      
      // Filter out empty features
      const filteredFeatures = newPlan.value.features.filter(feature => feature.trim() !== '')
      
      const planData = {
        ...newPlan.value,
        features: filteredFeatures.length > 0 ? filteredFeatures : ['Basic WiFi Access']
      }
      
      const response = await axios.post('/wifi/plans', planData)
      
      if (response.data.success) {
        // Add new plan to list
        plans.value.push(response.data.data)
        
        // Reset form and close modal
        newPlan.value = {
          name: '',
          description: '',
          price: 0,
          durationDays: 30,
          features: ['']
        }
        showAddPlanModal.value = false
      }
    } catch (error) {
      console.error('Error adding WiFi plan:', error)
      alert('Failed to add WiFi plan. Please try again.')
    } finally {
      saving.value = false
    }
  }
  
  function editPlan(plan) {
    editingPlan.value = { ...plan }
    
    // Ensure features is an array with at least one item
    if (!Array.isArray(editingPlan.value.features) || editingPlan.value.features.length === 0) {
      editingPlan.value.features = ['']
    }
    
    showEditPlanModal.value = true
  }
  
  async function updatePlan() {
    try {
      saving.value = true
      
      // Filter out empty features
      const filteredFeatures = editingPlan.value.features.filter(feature => feature.trim() !== '')
      
      const planData = {
        ...editingPlan.value,
        features: filteredFeatures.length > 0 ? filteredFeatures : ['Basic WiFi Access']
      }
      
      const response = await axios.put(`/wifi/plans/${editingPlan.value._id}`, planData)
      
      if (response.data.success) {
        // Update plan in list
        const index = plans.value.findIndex(plan => plan._id === editingPlan.value._id)
        if (index !== -1) {
          plans.value[index] = response.data.data
        }
        
        showEditPlanModal.value = false
      }
    } catch (error) {
      console.error('Error updating WiFi plan:', error)
      alert('Failed to update WiFi plan. Please try again.')
    } finally {
      saving.value = false
    }
  }
  
  function confirmDeactivatePlan(plan) {
    planToDelete.value = plan
    showDeleteModal.value = true
  }
  
  async function deactivatePlan() {
    try {
      if (!planToDelete.value) return
      
      deleting.value = true
      const response = await axios.delete(`/wifi/plans/${planToDelete.value._id}`)
      
      if (response.data.success) {
        // Update plan in list to show as inactive
        const index = plans.value.findIndex(plan => plan._id === planToDelete.value._id)
        if (index !== -1) {
          plans.value[index].isActive = false
        }
        
        // Close modal
        showDeleteModal.value = false
        planToDelete.value = null
      }
    } catch (error) {
      console.error('Error deactivating WiFi plan:', error)
      alert('Failed to deactivate WiFi plan. Please try again.')
    } finally {
      deleting.value = false
    }
  }
  
  async function activatePlan(planId) {
    try {
      const response = await axios.put(`/wifi/plans/${planId}`, {
        isActive: true
      })
      
      if (response.data.success) {
        // Update plan in list
        const index = plans.value.findIndex(plan => plan._id === planId)
        if (index !== -1) {
          plans.value[index].isActive = true
        }
      }
    } catch (error) {
      console.error('Error activating WiFi plan:', error)
      alert('Failed to activate WiFi plan. Please try again.')
    }
  }
  
  onMounted(() => {
    fetchPlans()
  })
  </script>