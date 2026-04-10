<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="handleResult(false)" />
        <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
          <p class="text-gray-900 text-center mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button
              @click="handleResult(false)"
              class="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
            >
              取消
            </button>
            <button
              @click="handleResult(true)"
              class="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { visible, message, handleResult } = useConfirm()
</script>

<style scoped>
.confirm-enter-active,
.confirm-leave-active { transition: opacity 0.2s ease; }
.confirm-enter-from,
.confirm-leave-to { opacity: 0; }
</style>
