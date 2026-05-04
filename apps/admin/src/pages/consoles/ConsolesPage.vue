<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Power, Tv, Wifi, AlertTriangle } from 'lucide-vue-next'
import api from '../../api/client'
import type { Host } from '../../types'

const consoles = ref<Host[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/consoles')
    consoles.value = data
  } catch {
    consoles.value = [
      { id: 'ps5-1', name: 'PS5-01', type: 'ps5', status: 'busy', controlMethod: 'playactor', ipAddress: '192.168.1.201' },
      { id: 'ps5-2', name: 'PS5-02', type: 'ps5', status: 'online', controlMethod: 'playactor', ipAddress: '192.168.1.202' },
      { id: 'ps5-3', name: 'PS5-03', type: 'ps5', status: 'offline', controlMethod: 'playactor', ipAddress: '192.168.1.203' },
      { id: 'ps2-1', name: 'PS2-01', type: 'ps2', status: 'online', controlMethod: 'tasmota' },
      { id: 'ps2-2', name: 'PS2-02', type: 'ps2', status: 'offline', controlMethod: 'tasmota' },
    ] as any
  } finally {
    loading.value = false
  }
})

const statusBadge = (status: string) => {
  const map: Record<string, { text: string; class: string }> = {
    online: { text: 'Вільна', class: 'bg-green-900/30 text-green-400' },
    busy: { text: 'Зайнята', class: 'bg-yellow-900/30 text-yellow-400' },
    offline: { text: 'Вимкнена', class: 'bg-red-900/30 text-red-400' },
  }
  return map[status] || { text: status, class: 'bg-gray-700 text-gray-400' }
}

const sendPlayactor = async (id: string, cmd: 'wake' | 'standby') => {
  await api.post(`/consoles/${id}/playactor`, { command: cmd })
}

const sendTasmota = async (id: string, cmd: 'on' | 'off') => {
  await api.post(`/consoles/${id}/tasmota`, { command: cmd })
}

const endSession = async (id: string) => {
  if (confirm('Завершити сесію консолі? (standby + таймер на відключення)')) {
    await api.post(`/consoles/${id}/end-session`)
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Управління консолями</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="console in consoles"
        :key="console.id"
        class="bg-gray-800/50 rounded-xl p-5 border border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center',
              console.type === 'ps5' ? 'bg-blue-900/30' : 'bg-purple-900/30'
            ]">
              <span class="text-xl">🎮</span>
            </div>
            <div>
              <h3 class="font-bold">{{ console.name }}</h3>
              <p class="text-xs text-gray-500">
                {{ console.type.toUpperCase() }} ·
                {{ console.controlMethod === 'playactor' ? 'playactor' : 'Tasmota' }}
              </p>
            </div>
          </div>
          <span :class="['px-2 py-1 rounded-full text-xs', statusBadge(console.status).class]">
            {{ statusBadge(console.status).text }}
          </span>
        </div>

        <!-- IP / Connection info -->
        <div v-if="console.ipAddress" class="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <Wifi class="w-3 h-3" />
          {{ console.ipAddress }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <template v-if="console.controlMethod === 'playactor'">
            <button
              @click="sendPlayactor(console.id, 'wake')"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 text-sm"
            >
              <Power class="w-3.5 h-3.5" /> Wake
            </button>
            <button
              @click="sendPlayactor(console.id, 'standby')"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 text-sm"
            >
              <Power class="w-3.5 h-3.5" /> Standby
            </button>
          </template>
          <template v-else>
            <button
              @click="sendTasmota(console.id, 'on')"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 text-sm"
            >
              <Power class="w-3.5 h-3.5" /> Увімкнути
            </button>
            <button
              @click="sendTasmota(console.id, 'off')"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm"
            >
              <Power class="w-3.5 h-3.5" /> Вимкнути
            </button>
          </template>
          <button
            v-if="console.status === 'busy'"
            @click="endSession(console.id)"
            class="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm"
            title="Завершити сесію"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Info block -->
    <div class="mt-6 bg-gray-800/30 rounded-xl p-5 border border-gray-700">
      <h3 class="font-medium mb-2">Як працює управління консолями</h3>
      <div class="text-sm text-gray-400 space-y-1">
        <p><strong class="text-blue-400">PS5 (playactor):</strong> Local Hub надсилає команди через протокол Remote Play по мережі. Підтримує wake/standby.</p>
        <p><strong class="text-purple-400">PS2 (Tasmota):</strong> WiFi-реле контролює живлення розетки. Просте ввімк/вимк.</p>
        <p><strong class="text-green-400">HDMI-CEC:</strong> Raspberry Pi управляє телевізором (вкл/вимк, повідомлення на екрані).</p>
      </div>
    </div>
  </div>
</template>
