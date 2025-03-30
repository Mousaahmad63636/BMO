<template>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="w-64 bg-white shadow-md">
        <div class="p-4 border-b">
          <h1 class="text-xl font-semibold text-primary-700">Billing Admin</h1>
        </div>
        
        <div class="p-4">
          <nav class="space-y-2">
            <router-link 
              v-for="item in navItems" 
              :key="item.name" 
              :to="{ name: item.routeName }"
              class="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-primary-50 hover:text-primary-700"
              :class="{ 'bg-primary-50 text-primary-700': isActiveRoute(item.routeName) }"
            >
              <i :class="item.icon" class="mr-3"></i>
              {{ item.label }}
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation -->
        <header class="bg-white shadow">
          <div class="flex justify-between items-center px-6 py-4">
            <h2 class="text-lg font-medium">{{ pageTitle }}</h2>
            
            <div class="flex items-center">
              <div class="mr-4 text-sm">{{ user?.name }}</div>
              <button @click="logout" class="text-gray-500 hover:text-gray-700">
                <i class="pi pi-sign-out text-lg"></i>
              </button>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-view />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  
  const user = computed(() => authStore.user)
  
  const navItems = [
    { label: 'Dashboard', routeName: 'dashboard', icon: 'pi pi-home' },
    { label: 'Customers', routeName: 'customers', icon: 'pi pi-users' },
    { label: 'Electricity Bills', routeName: 'electricity-bills', icon: 'pi pi-bolt' },
    { label: 'Electricity Settings', routeName: 'electricity-settings', icon: 'pi pi-cog' },
    { label: 'WiFi Plans', routeName: 'wifi-plans', icon: 'pi pi-wifi' },
    { label: 'WiFi Subscriptions', routeName: 'wifi-subscriptions', icon: 'pi pi-list' },
    { label: 'Revenue Reports', routeName: 'revenue-reports', icon: 'pi pi-chart-bar' },
  ]
  
  const pageTitle = computed(() => {
    const currentRoute = route.name
    const matchedNavItem = navItems.find(item => item.routeName === currentRoute)
    return matchedNavItem ? matchedNavItem.label : ''
  })
  
  function isActiveRoute(routeName) {
    return route.name === routeName
  }
  
  function logout() {
    authStore.logout()
  }
  </script>