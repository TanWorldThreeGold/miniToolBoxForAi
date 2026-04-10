<template>
  <div class="fixed top-4 right-4 z-[100] space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm"
        :class="t.type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-green-50 text-green-700 border border-green-200'"
      >
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateX(100px); }
</style>
