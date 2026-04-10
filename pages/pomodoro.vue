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
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <p class="text-sm text-gray-500">今日完成</p>
      <p class="text-2xl font-bold text-gray-900">{{ todayCount }} 个番茄</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

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

let timer: ReturnType<typeof setInterval> | null = null

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function switchMode(m: string) {
  stop()
  mode.value = m
  remaining.value = durations[m]
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
  start()
}

async function recordPomodoro() {
  await supabase.from('pomodoros').insert({
    user_id: user.value!.id,
    duration: Math.round((durations[mode.value] || customMinutes.value * 60) / 60),
  })
  todayCount.value++
}

async function fetchToday() {
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('pomodoros')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.value!.id)
    .gte('completed_at', today)
  todayCount.value = count || 0
}

onMounted(fetchToday)
onUnmounted(stop)
</script>
