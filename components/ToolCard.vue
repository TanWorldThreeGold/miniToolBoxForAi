<template>
  <NuxtLink
    :to="to"
    class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
  >
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
      :style="{ backgroundColor: bgColor }"
    >
      {{ icon }}
    </div>
    <h3 class="font-medium text-gray-900 group-hover:text-accent transition">{{ title }}</h3>
    <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  title: string
  description: string
  bgColor?: string
}>()
</script>
