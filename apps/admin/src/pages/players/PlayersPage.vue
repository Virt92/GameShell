<script setup lang="ts">
import { UserCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Гравці</h1>
    <div class="bg-gray-800/30 rounded-xl p-8 border border-gray-700 text-center text-gray-500">
      <UserCircle class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>База гравців клубу</p>
      <p class="text-sm mt-1">Пошук, баланси, історія сесій, бонуси</p>
    </div>
  </div>
</template>
