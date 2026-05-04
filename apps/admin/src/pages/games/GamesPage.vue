<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Download, RefreshCw, Trash2 } from 'lucide-vue-next'
import api from '../../api/client'
import type { Game } from '../../types'

const games = ref<Game[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/games')
    games.value = data
  } catch {
    games.value = [
      { id: '1', name: 'Counter-Strike 2', category: 'FPS', sizeGb: 35, _count: { hostGames: 35 } },
      { id: '2', name: 'Dota 2', category: 'MOBA', sizeGb: 30, _count: { hostGames: 35 } },
      { id: '3', name: 'Fortnite', category: 'Battle Royale', sizeGb: 90, _count: { hostGames: 20 } },
      { id: '4', name: 'Valorant', category: 'FPS', sizeGb: 25, _count: { hostGames: 35 } },
      { id: '5', name: 'GTA V', category: 'Action', sizeGb: 120, _count: { hostGames: 15 } },
    ] as Game[]
  } finally {
    loading.value = false
  }
})

const deployGame = async (gameId: string) => {
  await api.post('/games/deploy', {
    gameId,
    action: 'install',
    targetHosts: [], // TODO: select hosts
  })
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Каталог ігор</h1>
      <button class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        <Plus class="w-4 h-4" /> Додати гру
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="game in games"
        :key="game.id"
        class="bg-gray-800/50 rounded-xl p-5 border border-gray-700"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold">{{ game.name }}</h3>
            <p class="text-xs text-gray-500">{{ game.category }} · {{ game.sizeGb }} GB</p>
          </div>
          <span class="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {{ game._count?.hostGames || 0 }} ПК
          </span>
        </div>
        <div class="flex gap-2">
          <button
            @click="deployGame(game.id)"
            class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 text-sm"
          >
            <Download class="w-3.5 h-3.5" /> Встановити
          </button>
          <button class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 text-sm">
            <RefreshCw class="w-3.5 h-3.5" /> Оновити
          </button>
          <button class="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
