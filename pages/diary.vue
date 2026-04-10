<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">日记</h1>
      <button
        v-if="!editing"
        @click="startNew"
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
      >
        写日记
      </button>
    </div>

    <!-- 编辑 -->
    <div v-if="editing" class="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
      <div class="flex gap-2">
        <input
          v-model="form.date"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          v-model="form.mood"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">选择心情</option>
          <option value="😊">😊 开心</option>
          <option value="😐">😐 平静</option>
          <option value="😢">😢 难过</option>
          <option value="😡">😡 生气</option>
          <option value="😴">😴 疲惫</option>
        </select>
      </div>
      <input
        v-model="form.title"
        type="text"
        placeholder="标题（可选）"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        v-model="form.content"
        rows="8"
        placeholder="今天发生了什么..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      <div class="flex gap-2">
        <button
          @click="saveDiary"
          class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          保存
        </button>
        <button
          @click="editing = false"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 搜索 -->
    <div v-if="!editing" class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索日记..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>

    <!-- 列表 -->
    <div class="space-y-3">
      <div
        v-for="d in filteredDiaries"
        :key="d.id"
        class="bg-white border border-gray-200 rounded-xl p-4 group cursor-pointer hover:shadow-sm transition"
        @click="editDiary(d)"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">{{ d.date }}</span>
            <span v-if="d.mood">{{ d.mood }}</span>
          </div>
          <button
            @click.stop="deleteDiary(d.id)"
            class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
        <h3 v-if="d.title" class="font-medium text-gray-900 mb-1">{{ d.title }}</h3>
        <p class="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{{ d.content }}</p>
      </div>
      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="filteredDiaries.length === 0 && !editing" class="text-gray-400 text-center py-8">
        {{ searchQuery ? '无搜索结果' : '还没有日记，点击"写日记"开始' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { api } = useApi()
const { confirm } = useConfirm()

const editing = ref(false)
const editingId = ref<number | null>(null)
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: '',
  content: '',
  mood: '',
  date: today,
})

import type { Diary } from '~/types'

const diaries = ref<Diary[]>([])
const loading = ref(true)
const searchQuery = ref('')

const filteredDiaries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return diaries.value
  return diaries.value.filter(d =>
    d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
  )
})

function startNew() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.mood = ''
  form.date = today
  editing.value = true
}

function editDiary(d: Diary) {
  editingId.value = d.id
  form.title = d.title || ''
  form.content = d.content || ''
  form.mood = d.mood || ''
  form.date = d.date
  editing.value = true
}

async function saveDiary() {
  if (!form.content.trim()) return

  if (editingId.value) {
    const res = await api<Diary>('/api/diaries/' + editingId.value, {
      method: 'PUT',
      body: { title: form.title, content: form.content, mood: form.mood, date: form.date },
    })
    if (res.code === 200 && res.data) {
      const idx = diaries.value.findIndex(d => d.id === editingId.value)
      if (idx !== -1) diaries.value[idx] = res.data
    }
  } else {
    const res = await api<Diary>('/api/diaries', {
      method: 'POST',
      body: { title: form.title, content: form.content, mood: form.mood, date: form.date },
    })
    if (res.code === 200 && res.data) diaries.value.unshift(res.data)
  }
  editing.value = false
}

async function deleteDiary(id: number) {
  if (!await confirm('确定删除这篇日记？')) return
  const prev = diaries.value
  diaries.value = diaries.value.filter(d => d.id !== id)
  const res = await api('/api/diaries/' + id, { method: 'DELETE' })
  if (res.code !== 200) diaries.value = prev
}

async function fetchDiaries() {
  loading.value = true
  const res = await api<Diary[]>('/api/diaries')
  if (res.code === 200) diaries.value = res.data || []
  loading.value = false
}

onMounted(fetchDiaries)
</script>
