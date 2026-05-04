import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('./pages/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('./layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'Dashboard', component: () => import('./pages/dashboard/DashboardPage.vue') },
        { path: 'hosts', name: 'Hosts', component: () => import('./pages/hosts/HostsPage.vue') },
        { path: 'sessions', name: 'Sessions', component: () => import('./pages/sessions/SessionsPage.vue') },
        { path: 'games', name: 'Games', component: () => import('./pages/games/GamesPage.vue') },
        { path: 'shop', name: 'Shop', component: () => import('./pages/shop/ShopPage.vue') },
        { path: 'reports', name: 'Reports', component: () => import('./pages/reports/ReportsPage.vue') },
        { path: 'staff', name: 'Staff', component: () => import('./pages/staff/StaffPage.vue') },
        { path: 'players', name: 'Players', component: () => import('./pages/players/PlayersPage.vue') },
        { path: 'consoles', name: 'Consoles', component: () => import('./pages/consoles/ConsolesPage.vue') },
        { path: 'settings', name: 'Settings', component: () => import('./pages/settings/SettingsPage.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) auth.loadUser()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login' }
  }
})

export default router
