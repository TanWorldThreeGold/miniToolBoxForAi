<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">倒计时/纪念日</h1>

    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">添加纪念日</label>
        <form @submit.prevent="addCountdown" class="space-y-3">
          <input
            v-model="newEvent.title"
            type="text"
            placeholder="事件名称（如：生日、纪念日等）"
            required
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
          <input
            v-model="newEvent.date"
            type="date"
            required
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            :disabled="!newEvent.title.trim() || !newEvent.date"
            class="w-full py-3 bg-accent text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            添加
          </button>
        </form>
      </div>

      <div class="space-y-3">
        <div
          v-for="event in sortedEvents"
          :key="event.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ event.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ event.date }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold" :class="getDaysRemaining(event.date) > 0 ? 'text-green-500' : 'text-red-500'">
                {{ getDaysRemaining(event.date) }} 天
              </span>
              <button
                @click="deleteEvent(event.id)"
                class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                删除
              </button>
            </div>
          </div>
        </div>
        <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
        <p v-else-if="sortedEvents.length === 0" class="text-gray-400 text-center py-8">
          暂无纪念日
          <br>
          点击右上角添加
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CountdownEvent {
  id: number
  title: string
  date: string
}

const newEvent = ref({
  title: '',
  date: '',
})

const events = ref<CountdownEvent[]>([])
const loading = ref(true)

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  })
})

function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

async function fetchEvents() {
  loading.value = true
  const res = await $fetch<CountdownEvent[]>('/api/countdowns')
  if (res.code === 200) {
    events.value = res.data || []
  }
  loading.value = false
}

async function addCountdown() {
  if (!newEvent.value.title.trim() || !newEvent.value.date) return

  const res = await $fetch<CountdownEvent>('/api/countdowns', {
    method: 'POST',
    body: newEvent.value,
  })

  if (res.code === 200) {
    events.value.unshift(res.data)
    newEvent.title = ''
    newEvent.date = ''
  }
}

async function deleteEvent(id: number) {
  const prev = events.value
  events.value = events.value.filter(e => e.id !== id)

  const res = await $fetch(`/api/countdowns/${id}`, { method: 'DELETE' })

  if (res.code !== 200) {
    events.value = prev
  }
}

onMounted(fetchEvents)
</script>
