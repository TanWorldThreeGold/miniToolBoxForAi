<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">习惯打卡</h1>

    <form @submit.prevent="addHabit" class="flex gap-2 mb-6">
      <input
        v-model="newHabit"
        type="text"
        placeholder="添加新习惯..."
        class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        :disabled="!newHabit.trim()"
        class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        添加
      </button>
    </form>

    <div class="flex gap-2 mb-4">
      <button
        @click="showArchived = false"
        class="px-3 py-1 rounded-lg text-sm transition"
        :class="!showArchived ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'"
      >
        进行中
      </button>
      <button
        @click="showArchived = true"
        class="px-3 py-1 rounded-lg text-sm transition"
        :class="showArchived ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'"
      >
        已归档
      </button>
    </div>

    <p class="text-sm text-gray-400 dark:text-gray-500 mb-4">{{ todayDisplay }}</p>

    <div class="space-y-4">
      <div
        v-for="habit in filteredHabits"
        :key="habit.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 group"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button
              v-if="!habit.archived"
              @click="toggleCheck(habit)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-lg transition"
              :class="habit.checkedToday
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500'"
            >
              {{ habit.checkedToday ? '✓' : '○' }}
            </button>
            <span class="font-medium text-gray-900 dark:text-white" :class="{ 'line-through text-gray-400 dark:text-gray-500': habit.archived }">
              {{ habit.name }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="!habit.archived" class="text-sm text-gray-400 dark:text-gray-500">
              🔥 连续 {{ habit.streak }} 天
            </span>
            <button
              v-if="!habit.archived"
              @click="archiveHabit(habit)"
              class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              归档
            </button>
            <button
              v-else
              @click="unarchiveHabit(habit)"
              class="text-xs text-accent hover:underline"
            >
              恢复
            </button>
            <button
              @click="deleteHabit(habit.id)"
              class="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="mb-2">
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">最近30天</p>
          <div class="flex gap-0.5 flex-wrap">
            <div
              v-for="day in habit.last30"
              :key="day.date"
              class="w-3 h-3 rounded-sm"
              :class="day.checked ? 'bg-green-400' : 'bg-gray-100 dark:bg-gray-700'"
              :title="day.date + (day.checked ? ' ✓' : '')"
            ></div>
          </div>
        </div>

        <div class="flex gap-1">
          <div
            v-for="day in habit.last7"
            :key="day.date"
            class="w-8 h-8 rounded text-xs flex items-center justify-center"
            :class="day.checked ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500'"
            :title="day.date"
          >
            {{ day.label }}
          </div>
        </div>
      </div>

      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="filteredHabits.length === 0" class="text-gray-400 text-center py-8">
        {{ showArchived ? '暂无归档习惯' : '添加一个习惯开始打卡吧' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Habit } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const newHabit = ref('')
const showArchived = ref(false)
const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const habits = ref<(Habit & { archived: boolean })[]>([])
const loading = ref(true)

const filteredHabits = computed(() => habits.value.filter(h => h.archived === showArchived.value))

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      label: weekLabels[d.getDay()],
      checked: false,
    })
  }
  return days
}

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      checked: false,
    })
  }
  return days
}

async function fetchHabits() {
  loading.value = true
  const res = await api<{ habits: any[]; checks: any[] }>('/api/habits')
  if (res.code !== 200 || !res.data) { loading.value = false; return }

  const { habits: habitsData, checks } = res.data

  const checkMap = new Map<string, Set<string>>()
  for (const c of checks) {
    if (!checkMap.has(String(c.habit_id))) checkMap.set(String(c.habit_id), new Set())
    checkMap.get(String(c.habit_id))!.add(c.date)
  }

  habits.value = habitsData.map(h => {
    const dates = checkMap.get(String(h.id)) || new Set()
    const last7 = getLast7Days().map(d => ({ ...d, checked: dates.has(d.date) }))
    const last30 = getLast30Days().map(d => ({ ...d, checked: dates.has(d.date) }))

    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (i === 0 && !dates.has(dateStr)) continue
      if (dates.has(dateStr)) streak++
      else break
    }

    return { id: h.id, name: h.name, archived: h.archived || false, checkedToday: dates.has(today), streak, last7, last30 }
  })
  loading.value = false
}

async function addHabit() {
  if (!newHabit.value.trim()) return
  const res = await api('/api/habits', { method: 'POST', body: { name: newHabit.value.trim() } })
  if (res.code === 200) {
    newHabit.value = ''
    await fetchHabits()
  }
}

async function toggleCheck(habit: Habit) {
  const res = await api('/api/habits/check', {
    method: 'POST',
    body: { habitId: habit.id, date: today, checked: !habit.checkedToday },
  })
  if (res.code === 200) await fetchHabits()
}

async function archiveHabit(habit: Habit & { archived: boolean }) {
  const res = await api('/api/habits/' + habit.id, { method: 'PUT', body: { archived: true } })
  if (res.code === 200) habit.archived = true
}

async function unarchiveHabit(habit: Habit & { archived: boolean }) {
  const res = await api('/api/habits/' + habit.id, { method: 'PUT', body: { archived: false } })
  if (res.code === 200) habit.archived = false
}

async function deleteHabit(id: string) {
  if (!await confirm('确定删除这个习惯？')) return
  const res = await api('/api/habits/' + id, { method: 'DELETE' })
  if (res.code === 200) habits.value = habits.value.filter(h => h.id !== id)
}

onMounted(fetchHabits)
</script>
