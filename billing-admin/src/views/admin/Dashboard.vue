<template>
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Revenue Card -->
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 class="text-lg font-medium mb-1">Total Revenue</h3>
          <div class="text-3xl font-bold">
            <span v-if="loading"><Spinner /></span>
            <span v-else>${{ stats.totalRevenue.toFixed(2) }}</span>
          </div>
        </div>
        
        <!-- Electricity Stats Cards -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-1">Electricity Revenue</h3>
          <div class="text-2xl font-bold text-blue-600">
            <span v-if="loading"><Spinner /></span>
            <span v-else>${{ stats.electricityStats.revenue.toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex justify-between text-sm text-gray-500">
            <span>Paid: {{ stats.electricityStats.paidBills }}</span>
            <span>Unpaid: {{ stats.electricityStats.unpaidBills }}</span>
          </div>
        </div>
        
        <!-- WiFi Stats Cards -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-1">WiFi Revenue</h3>
          <div class="text-2xl font-bold text-green-600">
            <span v-if="loading"><Spinner /></span>
            <span v-else>${{ stats.wifiStats.revenue.toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex justify-between text-sm text-gray-500">
            <span>Paid: {{ stats.wifiStats.paidSubscriptions }}</span>
            <span>Unpaid: {{ stats.wifiStats.unpaidSubscriptions }}</span>
          </div>
        </div>
        
        <!-- Action Card -->
        <div class="card bg-gray-50">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <router-link :to="{name: 'electricity-bills'}" class="btn w-full block text-center">
              New Electricity Bill
            </router-link>
            <router-link :to="{name: 'wifi-subscriptions'}" class="btn-secondary w-full block text-center">
              New WiFi Subscription
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Top Customers Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top Electricity Customers -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Top Electricity Customers</h3>
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="2" class="px-4 py-3 text-center"><Spinner /></td>
              </tr>
              <tr v-else-if="stats.electricityStats.topCustomers.length === 0">
                <td colspan="2" class="px-4 py-3 text-center text-gray-500">No data available</td>
              </tr>
              <tr v-else v-for="customer in stats.electricityStats.topCustomers" :key="customer.customerId">
                <td class="px-4 py-2">{{ customer.customerName }}</td>
                <td class="px-4 py-2 text-right font-medium">${{ customer.totalAmount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Top WiFi Customers -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Top WiFi Customers</h3>
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="2" class="px-4 py-3 text-center"><Spinner /></td>
              </tr>
              <tr v-else-if="stats.wifiStats.topCustomers.length === 0">
                <td colspan="2" class="px-4 py-3 text-center text-gray-500">No data available</td>
              </tr>
              <tr v-else v-for="customer in stats.wifiStats.topCustomers" :key="customer.customerId">
                <td class="px-4 py-2">{{ customer.customerName }}</td>
                <td class="px-4 py-2 text-right font-medium">${{ customer.totalAmount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from '@/services/axios'
  
  const loading = ref(true)
  const stats = ref({
    totalRevenue: 0,
    electricityStats: {
      unpaidBills: 0,
      paidBills: 0,
      revenue: 0,
      topCustomers: []
    },
    wifiStats: {
      unpaidSubscriptions: 0,
      paidSubscriptions: 0,
      revenue: 0,
      topCustomers: []
    }
  })
  
  async function fetchDashboardStats() {
    try {
      loading.value = true
      const response = await axios.get('/admin/dashboard-stats')
      if (response.data.success) {
        stats.value = response.data.data
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchDashboardStats()
  })
  </script>