<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">习惯打卡</h1>

    <!-- 添加习惯 -->
    <form @submit.prevent="addHabit" class="flex gap-2 mb-6">
      <input
        v-model="newHabit"
        type="text"
        placeholder="添加新习惯..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        :disabled="!newHabit.trim()"
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
      >
        添加
      </button>
    </form>

    <!-- 今日日期 -->
    <p class="text-sm text-gray-400 mb-4">{{ todayDisplay }}</p>

    <!-- 习惯列表 -->
    <div class="space-y-3">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="bg-white border border-gray-200 rounded-xl p-4 group"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button
              @click="toggleCheck(habit)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-lg transition"
              :class="habit.checkedToday
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'"
            >
              {{ habit.checkedToday ? '✓' : '○' }}
            </button>
            <span class="font-medium text-gray-900">{{ habit.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">连续 {{ habit.streak }} 天</span>
            <button
              @click="deleteHabit(habit.id)"
              class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 最近7天 -->
        <div class="flex gap-1">
          <div
            v-for="day in habit.last7"
            :key="day.date"
            class="w-8 h-8 rounded text-xs flex items-center justify-center"
            :class="day.checked ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-300'"
            :title="day.date"
          >
            {{ day.label }}
          </div>
        </div>
      </div>
      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="habits.length === 0" class="text-gray-400 text-center py-8">
        添加一个习惯开始打卡吧
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Habit } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const newHabit = ref('')
const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const habits = ref<Habit[]>([])
const loading = ref(true)

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

    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (i === 0 && !dates.has(dateStr)) continue
      if (dates.has(dateStr)) streak++
      else break
    }

    return { id: h.id, name: h.name, checkedToday: dates.has(today), streak, last7 }
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

async function deleteHabit(id: number) {
  if (!await confirm('确定删除这个习惯？')) return
  const res = await api('/api/habits/' + id, { method: 'DELETE' })
  if (res.code === 200) habits.value = habits.value.filter(h => h.id !== id)
}

onMounted(fetchHabits)
</script>
