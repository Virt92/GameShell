<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pause, Play, Square, Clock } from 'lucide-vue-next'
import api from '../../api/client'
import type { Session } from '../../types'

const sessions = ref<Session[]>([])
const loading = ref(true)
const showNewSession = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/sessions')
    sessions.value = data
  } catch {
    sessions.value = []
  } finally {
    loading.value = false
  }
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
}

const getRemaining = (session: Session) => {
  if (!session.durationMin || session.status !== 'active') return '—'
  const start = new Date(session.startedAt).getTime()
  const end = start + session.durationMin * 60000
  const remaining = Math.max(0, Math.ceil((end - Date.now()) / 60000))
  return `${remaining} хв`
}

const handlePause = async (id: string) => { await api.put(`/sessions/${id}/pause`) }
const handleResume = async (id: string) => { await api.put(`/sessions/${id}/resume`) }
const handleStop = async (id: string) => { await api.delete(`/sessions/${id}`) }
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Сесії</h1>
      <button
        @click="showNewSession = true"
        class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <Plus class="w-4 h-4" />
        Нова сесія
      </button>
    </div>

    <!-- Active sessions -->
    <div class="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">ПК</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">Гравець</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">Тариф</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">Початок</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">Залишилось</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-400">Статус</th>
            <th class="text-right px-4 py-3 text-sm font-medium text-gray-400">Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="session in sessions"
            :key="session.id"
            class="border-b border-gray-800 hover:bg-gray-800/30"
          >
            <td class="px-4 py-3 text-sm font-medium">{{ session.host?.name }}</td>
            <td class="px-4 py-3 text-sm">{{ session.player?.nickname || 'Гість' }}</td>
            <td class="px-4 py-3 text-sm text-gray-400">{{ session.tariff?.name || '—' }}</td>
            <td class="px-4 py-3 text-sm text-gray-400">{{ formatTime(session.startedAt) }}</td>
            <td class="px-4 py-3 text-sm">
              <span class="flex items-center gap-1">
                <Clock class="w-3 h-3 text-yellow-400" />
                {{ getRemaining(session) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs',
                  session.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                ]"
              >
                {{ session.status === 'active' ? 'Активна' : 'Пауза' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-1">
                <button
                  v-if="session.status === 'active'"
                  @click="handlePause(session.id)"
                  class="p-1.5 rounded hover:bg-gray-700"
                  title="Пауза"
                >
                  <Pause class="w-4 h-4 text-yellow-400" />
                </button>
                <button
                  v-else
                  @click="handleResume(session.id)"
                  class="p-1.5 rounded hover:bg-gray-700"
                  title="Відновити"
                >
                  <Play class="w-4 h-4 text-green-400" />
                </button>
                <button
                  @click="handleStop(session.id)"
                  class="p-1.5 rounded hover:bg-gray-700"
                  title="Завершити"
                >
                  <Square class="w-4 h-4 text-red-400" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!sessions.length && !loading">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              Немає активних сесій
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
