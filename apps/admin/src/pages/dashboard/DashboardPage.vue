<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Monitor, Clock, DollarSign, Users } from 'lucide-vue-next'
import api from '../../api/client'
import type { DashboardStats } from '../../types'

const stats = ref<DashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/reports/dashboard')
    stats.value = data
  } catch {
    // Will show mock data for now
    stats.value = {
      activeSessions: 12,
      todayRevenue: 4850,
      hosts: { online: 18, busy: 12, offline: 5, maintenance: 0 },
      onlinePlayers: 10,
    }
  } finally {
    loading.value = false
  }
})

const cards = [
  { title: 'Активні сесії', key: 'activeSessions', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { title: 'Виручка сьогодні', key: 'todayRevenue', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-900/20', suffix: ' ₴' },
  { title: 'Онлайн гравців', key: 'onlinePlayers', icon: Users, color: 'text-purple-400', bg: 'bg-purple-900/20' },
]
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Дашборд</h1>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="card in cards"
        :key="card.key"
        :class="[card.bg, 'rounded-xl p-5 border border-gray-800']"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">{{ card.title }}</p>
            <p class="text-2xl font-bold mt-1" :class="card.color">
              {{ stats ? (stats as any)[card.key] : '—' }}{{ card.suffix || '' }}
            </p>
          </div>
          <component :is="card.icon" :class="[card.color, 'w-8 h-8 opacity-50']" />
        </div>
      </div>

      <!-- Hosts breakdown -->
      <div class="bg-gray-800/50 rounded-xl p-5 border border-gray-800">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-gray-400">Обладнання</p>
          <Monitor class="w-5 h-5 text-gray-500" />
        </div>
        <div v-if="stats" class="flex gap-3 text-sm">
          <span class="text-green-400">● {{ stats.hosts.online || 0 }} вільних</span>
          <span class="text-yellow-400">● {{ stats.hosts.busy || 0 }} зайнятих</span>
          <span class="text-red-400">● {{ stats.hosts.offline || 0 }} офлайн</span>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-800">
      <h2 class="text-lg font-semibold mb-4">Швидкі дії</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <router-link
          to="/sessions"
          class="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Clock class="w-6 h-6 text-blue-400 mb-2" />
          <span class="text-sm">Нова сесія</span>
        </router-link>
        <router-link
          to="/hosts"
          class="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Monitor class="w-6 h-6 text-green-400 mb-2" />
          <span class="text-sm">Карта ПК</span>
        </router-link>
        <router-link
          to="/games"
          class="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span class="text-2xl mb-1">🎮</span>
          <span class="text-sm">Ігри</span>
        </router-link>
        <router-link
          to="/consoles"
          class="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span class="text-2xl mb-1">🕹️</span>
          <span class="text-sm">Консолі</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
