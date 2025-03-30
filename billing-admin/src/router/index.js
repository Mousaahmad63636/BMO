import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Auth Views
import Login from '@/views/auth/Login.vue'

// Admin Views
import Dashboard from '@/views/admin/Dashboard.vue'
import Customers from '@/views/admin/customers/Customers.vue'
import CustomerDetail from '@/views/admin/customers/CustomerDetail.vue'
import ElectricityBills from '@/views/admin/electricity/ElectricityBills.vue'
import ElectricitySettings from '@/views/admin/electricity/ElectricitySettings.vue'
import WifiPlans from '@/views/admin/wifi/WifiPlans.vue'
import WifiSubscriptions from '@/views/admin/wifi/WifiSubscriptions.vue'
import RevenueReports from '@/views/admin/reports/RevenueReports.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login
      }
    ]
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: 'customers',
        name: 'customers',
        component: Customers
      },
      {
        path: 'customers/:id',
        name: 'customer-detail',
        component: CustomerDetail,
        props: true
      },
      {
        path: 'electricity/bills',
        name: 'electricity-bills',
        component: ElectricityBills
      },
      {
        path: 'electricity/settings',
        name: 'electricity-settings',
        component: ElectricitySettings
      },
      {
        path: 'wifi/plans',
        name: 'wifi-plans',
        component: WifiPlans
      },

      {
        path: 'electricity/bills/new',
        name: 'electricity-bills-new',
        component: () => import('@/views/admin/electricity/ElectricityBillNew.vue')
      },

      // WiFi Subscriptions New Route
      {
        path: 'wifi/subscriptions/new',
        name: 'wifi-subscriptions-new',
        component: () => import('@/views/admin/wifi/WifiSubscriptionNew.vue')
      },
      {
        path: 'wifi/subscriptions',
        name: 'wifi-subscriptions',
        component: WifiSubscriptions
      },
      {
        path: 'reports/revenue',
        name: 'revenue-reports',
        component: RevenueReports
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.path === '/auth/login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router