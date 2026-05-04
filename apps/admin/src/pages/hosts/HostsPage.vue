<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Monitor, Power, RotateCw, Lock } from 'lucide-vue-next'
import api from '../../api/client'
import type { Host } from '../../types'

const hosts = ref<Host[]>([])
const loading = ref(true)
const selectedHost = ref<Host | null>(null)
const filter = ref<string>('all')

onMounted(async () => {
  try {
    const { data } = await api.get('/hosts')
    hosts.value = data
  } catch {
    // Mock data for development
    hosts.value = Array.from({ length: 35 }, (_, i) => ({
      id: `pc-${i + 1}`,
      name: `PC-${String(i + 1).padStart(2, '0')}`,
      type: 'pc' as const,
      status: ['online', 'busy', 'offline', 'busy', 'online'][i % 5] as any,
      ipAddress: `192.168.1.${101 + i}`,
      controlMethod: 'agent',
      zone: { id: `z${Math.floor(i / 12)}`, name: ['VIP', 'Стандарт', 'PlayStation'][Math.floor(i / 12)] || 'Стандарт', sortOrder: 0 },
    }))
  } finally {
    loading.value = false
  }
})

const filteredHosts = computed(() => {
  if (filter.value === 'all') return hosts.value
  return hosts.value.filter(h => h.status === filter.value)
})

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-red-500',
    maintenance: 'bg-gray-500',
    booked: 'bg-blue-500',
  }
  return colors[status] || 'bg-gray-500'
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    online: 'Вільний',
    busy: 'Зайнятий',
    offline: 'Офлайн',
    maintenance: 'Обслуговування',
    booked: 'Заброньовано',
  }
  return labels[status] || status
}

const sendCommand = async (hostId: string, command: string) => {
  try {
    await api.post(`/hosts/${hostId}/command`, { command })
  } catch (e) {
    console.error('Command failed:', e)
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Обладнання</h1>
      <div class="flex gap-2">
        <button
          v-for="f in ['all', 'online', 'busy', 'offline']"
          :key="f"
          @click="filter = f"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm transition-colors',
            filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          {{ f === 'all' ? 'Всі' : statusLabel(f) }}
        </button>
      </div>
    </div>

    <!-- Host grid -->
    <div class="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
      <div
        v-for="host in filteredHosts"
        :key="host.id"
        @click="selectedHost = host"
        :class="[
          'relative p-3 rounded-xl border cursor-pointer transition-all hover:scale-105',
          selectedHost?.id === host.id ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-700',
          host.status === 'busy' ? 'bg-yellow-900/20' : host.status === 'offline' ? 'bg-red-900/10' : 'bg-gray-800/50'
        ]"
      >
        <div class="flex flex-col items-center">
          <Monitor class="w-8 h-8 mb-1" :class="host.status === 'offline' ? 'text-gray-600' : 'text-gray-300'" />
          <span class="text-xs font-medium">{{ host.name }}</span>
          <span :class="[statusColor(host.status), 'w-2 h-2 rounded-full mt-1']"></span>
        </div>
        <!-- Active session indicator -->
        <div v-if="host.sessions?.length" class="absolute top-1 right-1">
          <span class="text-xs text-yellow-400">●</span>
        </div>
      </div>
    </div>

    <!-- Selected host details -->
    <div v-if="selectedHost" class="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold">{{ selectedHost.name }}</h2>
          <p class="text-sm text-gray-400">
            {{ selectedHost.ipAddress }} · {{ selectedHost.type.toUpperCase() }} ·
            <span :class="[statusColor(selectedHost.status).replace('bg-', 'text-')]">{{ statusLabel(selectedHost.status) }}</span>
          </p>
        </div>
        <div class="flex gap-2">
          <button
            @click="sendCommand(selectedHost!.id, 'wake')"
            class="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
            title="Увімкнути (WoL)"
          >
            <Power class="w-4 h-4" />
          </button>
          <button
            @click="sendCommand(selectedHost!.id, 'restart')"
            class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
            title="Перезавантажити"
          >
            <RotateCw class="w-4 h-4" />
          </button>
          <button
            @click="sendCommand(selectedHost!.id, 'lock')"
            class="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30"
            title="Заблокувати"
          >
            <Lock class="w-4 h-4" />
          </button>
          <button
            @click="sendCommand(selectedHost!.id, 'shutdown')"
            class="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
            title="Вимкнути"
          >
            <Power class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Active session info -->
      <div v-if="selectedHost.sessions?.length" class="bg-gray-900/50 rounded-lg p-4">
        <h3 class="text-sm font-medium text-gray-400 mb-2">Активна сесія</h3>
        <div class="text-sm">
          <span class="text-white">{{ selectedHost.sessions[0].player?.nickname || 'Гість' }}</span>
          <span class="text-gray-500 mx-2">·</span>
          <span class="text-gray-400">{{ selectedHost.sessions[0].tariff?.name || 'Без тарифу' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
