<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">MODULE_TITLE</h1>

    <form @submit.prevent="addItem" class="flex gap-2 mb-6">
      <input
        v-model="newItem"
        type="text"
        placeholder="添加..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        :disabled="!newItem.trim()"
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
      >
        添加
      </button>
    </form>

    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 group"
      >
        <span class="text-gray-900">{{ item.name }}</span>
        <button
          @click="deleteItem(item.id)"
          class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      </div>
      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="items.length === 0" class="text-gray-400 text-center py-8">暂无数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITEM_TYPE } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const items = ref<ITEM_TYPE[]>([])
const loading = ref(true)
const newItem = ref('')

async function fetchItems() {
  loading.value = true
  const res = await api<ITEM_TYPE[]>('/api/ROUTE_NAME')
  if (res.code === 200) items.value = res.data || []
  loading.value = false
}

async function addItem() {
  if (!newItem.value.trim()) return
  const res = await api<ITEM_TYPE>('/api/ROUTE_NAME', { method: 'POST', body: { name: newItem.value.trim() } })
  if (res.code === 200 && res.data) {
    items.value.unshift(res.data)
    newItem.value = ''
  }
}

async function deleteItem(id: number) {
  if (!await confirm('确定删除？')) return
  const prev = items.value
  items.value = items.value.filter(i => i.id !== id)
  const res = await api('/api/ROUTE_NAME/' + id, { method: 'DELETE' })
  if (res.code !== 200) items.value = prev
}

onMounted(fetchItems)
</script>
