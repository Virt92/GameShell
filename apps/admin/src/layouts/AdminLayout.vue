<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  LayoutDashboard, Monitor, Clock, Gamepad2,
  ShoppingBag, BarChart3, Users, UserCircle,
  Tv, Settings, LogOut, Menu,
} from 'lucide-vue-next'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(true)

const navigation = computed(() => {
  const role = auth.user?.role
  const items = [
    { name: 'Дашборд', path: '/', icon: LayoutDashboard, roles: ['owner', 'devops', 'operator', 'accountant'] },
    { name: 'Обладнання', path: '/hosts', icon: Monitor, roles: ['owner', 'devops', 'operator'] },
    { name: 'Сесії', path: '/sessions', icon: Clock, roles: ['owner', 'operator'] },
    { name: 'Ігри', path: '/games', icon: Gamepad2, roles: ['owner', 'devops'] },
    { name: 'Магазин', path: '/shop', icon: ShoppingBag, roles: ['owner', 'operator'] },
    { name: 'Консолі', path: '/consoles', icon: Tv, roles: ['owner', 'devops', 'operator'] },
    { name: 'Звіти', path: '/reports', icon: BarChart3, roles: ['owner', 'accountant'] },
    { name: 'Персонал', path: '/staff', icon: Users, roles: ['owner'] },
    { name: 'Гравці', path: '/players', icon: UserCircle, roles: ['owner', 'operator'] },
    { name: 'Налаштування', path: '/settings', icon: Settings, roles: ['owner'] },
  ]
  return items.filter((item) => item.roles.includes(role || ''))
})

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[sidebarOpen ? 'w-64' : 'w-16', 'flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-200']"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-800">
        <button @click="sidebarOpen = !sidebarOpen" class="p-1 rounded hover:bg-gray-800">
          <Menu class="w-5 h-5" />
        </button>
        <span v-if="sidebarOpen" class="ml-3 text-lg font-bold text-green-400">GameShell</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors',
            route.path === item.path
              ? 'bg-green-600/20 text-green-400'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="sidebarOpen" class="ml-3 text-sm">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User -->
      <div class="border-t border-gray-800 p-4">
        <div v-if="sidebarOpen" class="text-sm mb-2">
          <div class="font-medium">{{ auth.user?.name || 'Admin' }}</div>
          <div class="text-xs text-gray-500">{{ auth.user?.role }}</div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut class="w-4 h-4" />
          <span v-if="sidebarOpen">Вийти</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
