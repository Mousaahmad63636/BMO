<template>
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold text-gray-800">Revenue Reports</h2>
      
      <!-- Filters -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="col-span-1">
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              id="start-date" 
              v-model="filters.startDate" 
              type="date" 
              class="form-input"
            />
          </div>
          
          <div class="col-span-1">
            <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              id="end-date" 
              v-model="filters.endDate" 
              type="date" 
              class="form-input"
            />
          </div>
          
          <div class="col-span-1">
            <label for="report-type" class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select id="report-type" v-model="filters.type" class="form-input">
              <option value="both">Electricity & WiFi</option>
              <option value="electricity">Electricity Only</option>
              <option value="wifi">WiFi Only</option>
            </select>
          </div>
          
          <div class="col-span-1 flex items-end">
            <button @click="fetchReports" class="btn w-full">
              <span v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Loading...</span>
              <span v-else>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 class="text-lg font-medium mb-1">Total Revenue</h3>
          <div class="text-3xl font-bold">
            ${{ totalRevenue.toFixed(2) }}
          </div>
          <p class="mt-2 text-sm opacity-90">
            {{ formatDate(filters.startDate) }} - {{ formatDate(filters.endDate) }}
          </p>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-1">Electricity Revenue</h3>
          <div class="text-2xl font-bold text-blue-600">
            ${{ electricityRevenue.toFixed(2) }}
          </div>
          <p class="mt-2 text-sm text-gray-500">
            {{ electricityDataPoints.length }} transactions
          </p>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-1">WiFi Revenue</h3>
          <div class="text-2xl font-bold text-green-600">
            ${{ wifiRevenue.toFixed(2) }}
          </div>
          <p class="mt-2 text-sm text-gray-500">
            {{ wifiDataPoints.length }} transactions
          </p>
        </div>
      </div>
      
      <!-- Revenue Chart -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-700 mb-4">Revenue Over Time</h3>
        
        <div v-if="loading" class="py-10 text-center">
          <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
          <p class="mt-2 text-gray-500">Loading chart data...</p>
        </div>
        
        <div v-else-if="!hasData" class="py-10 text-center">
          <p class="text-gray-500">No data available for the selected period</p>
        </div>
        
        <div v-else ref="chartContainer" style="height: 400px;"></div>
      </div>
      
      <!-- Detailed Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Electricity Breakdown -->
        <div v-if="filters.type !== 'wifi'" class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Electricity Revenue Breakdown</h3>
          
          <div v-if="loading" class="py-6 text-center">
            <i class="pi pi-spin pi-spinner text-xl text-primary-500"></i>
          </div>
          
          <div v-else-if="electricityDataPoints.length === 0" class="py-6 text-center">
            <p class="text-gray-500">No electricity revenue data for this period</p>
          </div>
          
          <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(point, index) in electricityDataPoints" :key="index" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ point._id }}</td>
                  <td class="px-4 py-2 text-sm text-gray-900 text-right font-medium">${{ point.amount.toFixed(2) }}</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium">Total</td>
                  <td class="px-4 py-3 text-sm font-bold text-right">${{ electricityRevenue.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- WiFi Breakdown -->
        <div v-if="filters.type !== 'electricity'" class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-4">WiFi Revenue Breakdown</h3>
          
          <div v-if="loading" class="py-6 text-center">
            <i class="pi pi-spin pi-spinner text-xl text-primary-500"></i>
          </div>
          
          <div v-else-if="wifiDataPoints.length === 0" class="py-6 text-center">
            <p class="text-gray-500">No WiFi revenue data for this period</p>
          </div>
          
          <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(point, index) in wifiDataPoints" :key="index" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ point._id }}</td>
                  <td class="px-4 py-2 text-sm text-gray-900 text-right font-medium">${{ point.amount.toFixed(2) }}</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium">Total</td>
                  <td class="px-4 py-3 text-sm font-bold text-right">${{ wifiRevenue.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Export Options -->
      <div class="flex justify-end">
        <button 
          @click="exportToPDF" 
          class="btn-secondary flex items-center mr-3"
        >
          <i class="pi pi-file-pdf mr-2"></i> Export as PDF
        </button>
        <button 
          @click="exportToCSV" 
          class="btn flex items-center"
        >
          <i class="pi pi-file-excel mr-2"></i> Export as CSV
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import axios from '@/services/axios'
  import Chart from 'chart.js/auto'
  
  const loading = ref(false)
  const chartContainer = ref(null)
  const chart = ref(null)
  
  // Initialize with last 30 days as default
  const defaultStartDate = new Date()
  defaultStartDate.setDate(defaultStartDate.getDate() - 30)
  
  const filters = ref({
    startDate: formatDateForInput(defaultStartDate),
    endDate: formatDateForInput(new Date()),
    type: 'both'
  })
  
  const reportData = ref({
    electricityRevenue: [],
    wifiRevenue: []
  })
  
  const electricityDataPoints = computed(() => {
    return reportData.value.electricityRevenue || []
  })
  
  const wifiDataPoints = computed(() => {
    return reportData.value.wifiRevenue || []
  })
  
  const electricityRevenue = computed(() => {
    return electricityDataPoints.value.reduce((total, point) => total + point.amount, 0)
  })
  
  const wifiRevenue = computed(() => {
    return wifiDataPoints.value.reduce((total, point) => total + point.amount, 0)
  })
  
  const totalRevenue = computed(() => {
    return electricityRevenue.value + wifiRevenue.value
  })
  
  const hasData = computed(() => {
    return electricityDataPoints.value.length > 0 || wifiDataPoints.value.length > 0
  })
  
  async function fetchReports() {
    try {
      loading.value = true
      
      const params = {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        type: filters.value.type
      }
      
      const response = await axios.get('/admin/revenue-reports', { params })
      
      if (response.data.success) {
        reportData.value = response.data.data
        renderChart()
      }
    } catch (error) {
      console.error('Error fetching revenue reports:', error)
      alert('Failed to fetch revenue reports. Please try again.')
    } finally {
      loading.value = false
    }
  }
  
  function renderChart() {
    if (!hasData.value) return
    
    // Destroy existing chart if it exists
    if (chart.value) {
      chart.value.destroy()
    }
    
    const ctx = chartContainer.value.getContext('2d')
    
    // Prepare datasets
    const datasets = []
    
    if (electricityDataPoints.value.length > 0 && filters.value.type !== 'wifi') {
      datasets.push({
        label: 'Electricity Revenue',
        data: electricityDataPoints.value.map(point => ({ x: point._id, y: point.amount })),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.1
      })
    }
    
    if (wifiDataPoints.value.length > 0 && filters.value.type !== 'electricity') {
      datasets.push({
        label: 'WiFi Revenue',
        data: wifiDataPoints.value.map(point => ({ x: point._id, y: point.amount })),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.1
      })
    }
    
    // Create chart
    chart.value = new Chart(ctx, {
      type: 'line',
      data: {
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM dd, yyyy',
              displayFormats: {
                day: 'MMM dd'
              }
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue ($)'
            }
          }
        }
      }
    })
  }
  
  function exportToPDF() {
    alert('PDF export functionality would be implemented here')
    // This would typically use a library like jsPDF to generate a PDF
  }
  
  function exportToCSV() {
    alert('CSV export functionality would be implemented here')
    // This would generate and download a CSV file
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString(undefined, options)
  }
  
  function formatDateForInput(date) {
    if (!date) return ''
    
    // Format as YYYY-MM-DD for input[type="date"]
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${year}-${month}-${day}`
  }
  
  // Watch for filter changes and update chart
  watch([() => filters.value.type], () => {
    if (hasData.value) {
      renderChart()
    }
  })
  
  onMounted(() => {
    fetchReports()
  })
  </script>