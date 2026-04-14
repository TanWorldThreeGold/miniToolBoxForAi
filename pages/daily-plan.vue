<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">日计划</h1>

    <!-- 日期导航 -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="changeDate(-1)" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">←</button>
      <input
        v-model="selectedDate"
        type="date"
        class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center"
        @change="fetchPlan"
      />
      <button @click="changeDate(1)" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">→</button>
      <button @click="goToday" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">今天</button>
    </div>

    <!-- 加载中 -->
    <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>

    <!-- 无计划态：创建表单 -->
    <div v-else-if="!plan && !creating" class="text-center py-12">
      <p class="text-gray-400 mb-4">{{ selectedDate }} 暂无计划</p>
      <button @click="creating = true" class="px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition">
        创建计划
      </button>
    </div>

    <!-- 创建计划表单 -->
    <div v-else-if="!plan && creating" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">新建 {{ selectedDate }} 计划</h2>
        <button @click="creating = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
      </div>

      <div v-for="(item, i) in newItems" :key="i" class="flex items-center gap-2">
        <span class="text-gray-400 text-sm w-6 text-right">{{ i + 1 }}.</span>
        <input
          v-model="item.title"
          type="text"
          placeholder="计划内容..."
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
          @keyup.enter="addNewItem"
        />
        <button v-if="newItems.length > 1" @click="newItems.splice(i, 1)" class="text-gray-300 hover:text-red-500">✕</button>
      </div>

      <button @click="addNewItem" class="text-sm text-accent hover:underline">+ 添加一项</button>

      <textarea
        v-model="newNote"
        placeholder="备注（可选）"
        rows="2"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none"
      />

      <button
        @click="createPlan"
        :disabled="!hasValidItems"
        class="w-full py-2 bg-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        保存计划
      </button>
    </div>

    <!-- 有计划态 -->
    <div v-else-if="plan" class="space-y-4">
      <!-- 计划备注 -->
      <div v-if="plan.note" class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ plan.note }}</p>
      </div>

      <!-- 进度条 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="text-gray-500 dark:text-gray-400">完成进度</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ completedCount }}/{{ plan.items?.length || 0 }}</span>
        </div>
        <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-accent rounded-full transition-all duration-300"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </div>

      <!-- 条目列表 -->
      <div class="space-y-2">
        <div
          v-for="item in sortedItems"
          :key="item.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 group"
        >
          <div class="flex items-center gap-3">
            <button
              @click="toggleItem(item)"
              class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition"
              :class="item.completed ? 'bg-accent border-accent text-white' : 'border-gray-300 dark:border-gray-600 hover:border-accent'"
            >
              <span v-if="item.completed" class="text-xs">✓</span>
            </button>

            <span
              v-if="editingItemId !== item.id"
              class="flex-1 text-gray-900 dark:text-white cursor-pointer"
              :class="{ 'line-through text-gray-400 dark:text-gray-500': item.completed }"
              @dblclick="startEditItem(item)"
            >
              {{ item.title }}
            </span>
            <input
              v-else
              v-model="editingItemTitle"
              @keyup.enter="saveEditItem(item)"
              @keyup.escape="editingItemId = null"
              class="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
            />

            <button
              v-if="editingItemId === item.id"
              @click="saveEditItem(item)"
              class="text-accent text-sm"
            >保存</button>
            <button
              @click="deleteItem(item.id)"
              class="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >✕</button>
          </div>
        </div>
      </div>

      <!-- 追加条目 -->
      <form @submit.prevent="addItem" class="flex gap-2">
        <input
          v-model="addItemTitle"
          type="text"
          placeholder="追加计划项..."
          class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          :disabled="!addItemTitle.trim()"
          class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >添加</button>
      </form>

      <!-- 操作按钮 -->
      <div class="flex gap-3 pt-2">
        <NuxtLink
          :to="`/daily-report?date=${selectedDate}&generate=true`"
          class="flex-1 py-2 bg-gray-900 dark:bg-gray-700 text-white text-center rounded-lg hover:opacity-90 transition"
        >
          生成日报 →
        </NuxtLink>
        <button
          @click="deletePlan"
          class="px-4 py-2 text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >删除计划</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyPlan, PlanItem } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()
const route = useRoute()

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const today = computed(getToday)
const selectedDate = ref((route.query.date as string) || today.value)
const plan = ref<(DailyPlan & { items?: PlanItem[] }) | null>(null)
const loading = ref(true)
const creating = ref(false)

// Create form
const newItems = ref([{ title: '' }])
const newNote = ref('')

// Edit item
const editingItemId = ref<number | null>(null)
const editingItemTitle = ref('')

// Add item
const addItemTitle = ref('')

const hasValidItems = computed(() => newItems.value.some(i => i.title.trim()))

const sortedItems = computed(() =>
  [...(plan.value?.items || [])].sort((a, b) => a.sort_order - b.sort_order)
)

const completedCount = computed(() =>
  (plan.value?.items || []).filter(i => i.completed).length
)

const progressPercent = computed(() => {
  const total = plan.value?.items?.length || 0
  if (total === 0) return 0
  return Math.round((completedCount.value / total) * 100)
})

function changeDate(delta: number) {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const date = new Date(y, m - 1, d + delta)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  selectedDate.value = `${yyyy}-${mm}-${dd}`
  fetchPlan()
}

function goToday() {
  selectedDate.value = today.value
  fetchPlan()
}

async function fetchPlan() {
  loading.value = true
  creating.value = false
  const res = await api<any>(`/api/daily-plans?date=${selectedDate.value}`)
  if (res.code === 200 && res.data) {
    plan.value = {
      ...res.data,
      items: res.data.plan_items || [],
    }
  } else {
    plan.value = null
  }
  loading.value = false
}

async function createPlan() {
  const items = newItems.value
    .filter(i => i.title.trim())
    .map((i, idx) => ({ title: i.title.trim(), sort_order: idx }))
  if (items.length === 0) return

  const res = await api<any>('/api/daily-plans', {
    method: 'POST',
    body: { date: selectedDate.value, note: newNote.value.trim(), items },
  })
  if (res.code === 200 && res.data) {
    plan.value = {
      ...res.data,
      items: res.data.plan_items || [],
    }
    creating.value = false
    newItems.value = [{ title: '' }]
    newNote.value = ''
  }
}

function addNewItem() {
  newItems.value.push({ title: '' })
}

async function toggleItem(item: PlanItem) {
  item.completed = !item.completed
  const res = await api(`/api/plan-items/${item.id}`, {
    method: 'PUT',
    body: { completed: item.completed },
  })
  if (res.code !== 200) item.completed = !item.completed
}

function startEditItem(item: PlanItem) {
  editingItemId.value = item.id
  editingItemTitle.value = item.title
}

async function saveEditItem(item: PlanItem) {
  const trimmed = editingItemTitle.value.trim()
  if (!trimmed) return
  const prev = item.title
  item.title = trimmed
  editingItemId.value = null
  const res = await api(`/api/plan-items/${item.id}`, {
    method: 'PUT',
    body: { title: trimmed },
  })
  if (res.code !== 200) item.title = prev
}

async function addItem() {
  const title = addItemTitle.value.trim()
  if (!title || !plan.value) return
  const sortOrder = (plan.value.items?.length || 0)
  const res = await api<PlanItem>('/api/plan-items', {
    method: 'POST',
    body: { plan_id: plan.value.id, title, sort_order: sortOrder },
  })
  if (res.code === 200 && res.data) {
    plan.value.items = [...(plan.value.items || []), res.data]
    addItemTitle.value = ''
  }
}

async function deleteItem(id: number) {
  if (!plan.value) return
  const prev = plan.value.items || []
  plan.value.items = prev.filter(i => i.id !== id)
  const res = await api(`/api/plan-items/${id}`, { method: 'DELETE' })
  if (res.code !== 200) plan.value.items = prev
}

async function deletePlan() {
  if (!plan.value) return
  if (!await confirm('确定删除该日计划？所有条目将一并删除。')) return
  const res = await api(`/api/daily-plans/${plan.value.id}`, { method: 'DELETE' })
  if (res.code === 200) {
    plan.value = null
  }
}

onMounted(fetchPlan)
</script>
