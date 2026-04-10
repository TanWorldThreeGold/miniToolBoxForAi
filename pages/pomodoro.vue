<template>
  <div class="max-w-sm mx-auto text-center">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">番茄钟</h1>

    <!-- 模式切换 -->
    <div class="flex gap-2 mb-8 justify-center">
      <button
        v-for="m in modes"
        :key="m.key"
        @click="switchMode(m.key)"
        class="px-4 py-1.5 rounded-lg text-sm font-medium transition"
        :class="mode === m.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- 计时器 -->
    <div class="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
      <p class="text-6xl font-mono font-bold text-gray-900">
        {{ formatTime(remaining) }}
      </p>
      <div class="flex gap-3 justify-center mt-6">
        <button
          @click="toggle"
          class="px-8 py-2.5 rounded-lg font-medium transition"
          :class="running ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-900 text-white hover:bg-gray-800'"
        >
          {{ running ? '暂停' : '开始' }}
        </button>
        <button
          @click="reset"
          class="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 自定义倒计时 -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <p class="text-sm font-medium text-gray-700 mb-2">自定义倒计时（分钟）</p>
      <div class="flex gap-2 justify-center">
        <input
          v-model.number="customMinutes"
          type="number"
          min="1"
          max="120"
          class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          @click="startCustom"
          class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
        >
          开始
        </button>
      </div>
    </div>

    <!-- 今日统计 -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <p class="text-sm text-gray-500">今日完成</p>
      <p class="text-2xl font-bold text-gray-900">{{ todayCount }} 个番茄</p>
    </div>

    <!-- 历史记录 -->
    <div class="text-left">
      <h2 class="font-medium text-gray-900 mb-3">最近记录</h2>
      <div class="space-y-2">
        <div
          v-for="item in history"
          :key="item.id"
          class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
        >
          <span class="text-gray-500">{{ formatDate(item.created_at) }}</span>
          <span class="font-medium text-gray-900">{{ item.duration }} 分钟</span>
        </div>
        <p v-if="history.length === 0" class="text-gray-400 text-center py-4 text-sm">暂无记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { api } = useApi()

const modes = [
  { key: 'focus', label: '专注 25min' },
  { key: 'short', label: '短休 5min' },
  { key: 'long', label: '长休 15min' },
]

const durations: Record<string, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
const mode = ref('focus')
const remaining = ref(durations.focus)
const running = ref(false)
const customMinutes = ref(10)
const todayCount = ref(0)
const history = ref<{ id: number; duration: number; created_at: string }[]>([])
let startDuration = durations.focus

let timer: ReturnType<typeof setInterval> | null = null

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function switchMode(m: string) {
  stop()
  mode.value = m
  remaining.value = durations[m]
  startDuration = durations[m]
}

function toggle() {
  running.value ? stop() : start()
}

function start() {
  running.value = true
  timer = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stop()
      notifyComplete()
      if (mode.value === 'focus') recordPomodoro()
    }
  }, 1000)
}

function stop() {
  running.value = false
  if (timer) { clearInterval(timer); timer = null }
}

function reset() {
  stop()
  remaining.value = durations[mode.value]
}

function startCustom() {
  stop()
  mode.value = 'focus'
  remaining.value = customMinutes.value * 60
  startDuration = customMinutes.value * 60
  start()
}

function notifyComplete() {
  // 声音提醒
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 1000
      gain2.gain.value = 0.3
      osc2.start()
      osc2.stop(ctx.currentTime + 0.5)
    }, 600)
  } catch {}

  // 浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('番茄钟完成！', { body: '休息一下吧' })
  }
}

// 请求通知权限
function requestNotification() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

async function recordPomodoro() {
  const duration = Math.round(startDuration / 60)
  const res = await api<{ id: number; duration: number; created_at: string }>('/api/pomodoros', { method: 'POST', body: { duration } })
  if (res.code === 200 && res.data) {
    todayCount.value++
    history.value.unshift(res.data)
  }
}

async function fetchData() {
  const res = await api<{ count: number; history: any[] }>('/api/pomodoros')
  if (res.code === 200 && res.data) {
    todayCount.value = res.data.count
    history.value = res.data.history
  }
}

onMounted(() => {
  fetchData()
  requestNotification()
})
onUnmounted(stop)
</script>
