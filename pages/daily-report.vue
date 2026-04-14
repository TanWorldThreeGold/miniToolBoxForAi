<template>
  <div class="max-w-2xl mx-auto">
    <!-- 页面标题 -->
    <div class="flex items-center gap-3 mb-5">
      <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">📊</div>
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">日报</h1>
        <p class="text-xs text-gray-400">自动生成每日工作报告</p>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        @click="viewMode = 'single'"
        class="flex-1 py-1.5 text-sm rounded-md transition font-medium"
        :class="viewMode === 'single' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >单日日报</button>
      <button
        @click="viewMode = 'range'"
        class="flex-1 py-1.5 text-sm rounded-md transition font-medium"
        :class="viewMode === 'range' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >日报列表</button>
    </div>

    <!-- ========== 单日视图 ========== -->
    <template v-if="viewMode === 'single'">
      <!-- 日期导航 -->
      <div class="flex items-center gap-2 mb-6">
        <button @click="changeDate(-1)" class="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="flex-1 relative">
          <input
            v-model="selectedDate"
            type="date"
            class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="fetchReport"
          />
        </div>
        <button @click="changeDate(1)" class="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        <button
          @click="goToday"
          class="h-9 px-3 rounded-lg text-xs font-medium transition"
          :class="isToday ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'"
        >今天</button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 顺延选择对话框 -->
      <div v-else-if="showCarryForward" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 class="font-semibold text-gray-900 dark:text-white">选择顺延条目</h2>
          <p class="text-xs text-gray-400 mt-1">以下未完成的条目可以顺延到明天的计划中</p>
        </div>
        <div class="p-3 space-y-1">
          <label
            v-for="item in incompleteItems"
            :key="item.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition"
            :class="carryForwardIds.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'"
          >
            <input type="checkbox" :value="item.id" v-model="carryForwardIds" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
            <span class="text-sm text-gray-900 dark:text-white">{{ item.title }}</span>
          </label>
        </div>
        <div class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div class="flex gap-3">
            <button @click="carryForwardIds = incompleteItems.map(i => i.id)" class="text-xs text-blue-500 hover:text-blue-600">全选</button>
            <button @click="carryForwardIds = []" class="text-xs text-gray-400 hover:text-gray-600">全不选</button>
          </div>
          <div class="flex gap-2">
            <button @click="showCarryForward = false" class="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">取消</button>
            <button @click="confirmGenerate" :disabled="generating" class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition">确认生成</button>
          </div>
        </div>
      </div>

      <!-- 无日报态 -->
      <div v-else-if="!report" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
        <div class="flex flex-col items-center py-16 px-6">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-4">📝</div>
          <p class="text-gray-900 dark:text-white font-medium mb-1">暂无日报</p>
          <p class="text-sm text-gray-400 mb-6">{{ selectedDate }}</p>
          <div class="flex gap-3">
            <button @click="startGenerate" :disabled="generating" class="px-5 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition shadow-sm">
              {{ generating ? '生成中...' : '自动生成' }}
            </button>
            <button @click="createEmptyReport" :disabled="generating" class="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition">
              手动撰写
            </button>
          </div>
        </div>
      </div>

      <!-- 日报内容 -->
      <div v-else class="space-y-4">
        <!-- 自动摘要 -->
        <div v-if="report.auto_summary" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">自动生成摘要</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="copySummary"
                class="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                :title="copySuccess ? '已复制' : '复制摘要'"
              >
                <svg v-if="!copySuccess" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </button>
              <button @click="refreshSummary" :disabled="generating" class="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition" title="刷新摘要">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114.32-3.22M20 15a8 8 0 01-14.32 3.22"/></svg>
              </button>
            </div>
          </div>
          <div class="px-5 py-4">
            <div class="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ report.auto_summary }}</div>
          </div>
        </div>

        <!-- 手动内容 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg class="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </div>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">补充内容</span>
            </div>
            <button v-if="!editing" @click="editing = true" class="text-xs text-blue-500 hover:text-blue-600 font-medium">编辑</button>
          </div>
          <div class="px-5 py-4">
            <div v-if="!editing">
              <p v-if="report.content" class="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ report.content }}</p>
              <p v-else class="text-sm text-gray-400 italic">暂无补充内容，点击编辑添加</p>
            </div>
            <div v-else class="space-y-3">
              <textarea
                v-model="editContent"
                rows="6"
                placeholder="写下今天的感想、备注..."
                class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="flex gap-2 justify-end">
                <button @click="cancelEdit" class="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">取消</button>
                <button @click="saveContent" class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">保存</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex items-center justify-between pt-2">
          <NuxtLink :to="`/daily-plan?date=${selectedDate}`" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            查看当天计划
          </NuxtLink>
          <button
            @click="deleteReport"
            :disabled="deleting"
            class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 disabled:opacity-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            {{ deleting ? '删除中...' : '删除日报' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 日报列表视图 ========== -->
    <template v-else>
      <!-- 范围选择 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 sm:p-5 mb-4">
        <!-- 预设按钮 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="p in rangePresets"
            :key="p.label"
            @click="setRangePreset(p.key)"
            class="px-3 py-1.5 text-xs rounded-lg font-medium transition"
            :class="activePreset === p.key ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >{{ p.label }}</button>
        </div>
        <!-- 自定义范围 -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input v-model="rangeFrom" type="date" class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" @change="activePreset = ''; fetchRangeReports()" />
          <span class="text-gray-400 text-sm text-center">至</span>
          <input v-model="rangeTo" type="date" class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" @change="activePreset = ''; fetchRangeReports()" />
          <button @click="fetchRangeReports" class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition sm:w-auto">查询</button>
        </div>
      </div>

      <!-- 统计栏 + 批量操作 -->
      <div v-if="rangeFrom && rangeTo && !rangeLoading" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 px-1">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 <span class="font-medium text-gray-900 dark:text-white">{{ rangeReports.length }}</span> 份日报
          <template v-if="missingReportCount > 0">
            ，<span class="font-medium text-amber-600 dark:text-amber-400">{{ missingReportCount }}</span> 天缺失
          </template>
        </span>
        <div class="flex gap-2">
          <button
            v-if="missingReportCount > 0"
            @click="batchGenerate"
            :disabled="batchGenerating"
            class="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium"
          >{{ batchGenerating ? '批量生成中...' : `批量生成 (${missingReportCount} 天)` }}</button>
          <button
            v-if="rangeReports.length > 0"
            @click="copyRangeMarkdown"
            class="px-3 py-1.5 text-xs rounded-lg font-medium transition inline-flex items-center gap-1"
            :class="rangeCopySuccess ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            <svg v-if="!rangeCopySuccess" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ rangeCopySuccess ? '已复制' : '复制全部' }}
          </button>
        </div>
      </div>

      <!-- 批量生成结果提示 -->
      <div v-if="batchResult !== null" class="mb-4 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
        成功生成 {{ batchResult }} 份日报
      </div>

      <!-- 加载中 -->
      <div v-if="rangeLoading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Markdown 文档区 -->
      <div v-else-if="rangeReports.length > 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ rangeFrom }} ~ {{ rangeTo }}</span>
          <span class="text-xs text-gray-400">{{ rangeReports.length }} 份日报</span>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="r in rangeReports" :key="r.id" class="px-5 py-4">
            <div class="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ r.auto_summary }}</div>
            <div v-if="r.content" class="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
              <p class="text-xs text-gray-400 mb-1">补充内容</p>
              <div class="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ r.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="rangeFrom && rangeTo && !rangeLoading" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
        <div class="flex flex-col items-center py-16 px-6">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-4">📭</div>
          <p class="text-gray-900 dark:text-white font-medium mb-1">该范围内暂无日报</p>
          <p class="text-sm text-gray-400 mb-6">{{ rangeFrom }} ~ {{ rangeTo }}</p>
          <button
            @click="batchGenerate"
            :disabled="batchGenerating"
            class="px-5 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition shadow-sm"
          >{{ batchGenerating ? '生成中...' : '批量生成' }}</button>
        </div>
      </div>

      <!-- 初始引导 -->
      <div v-else class="text-center py-12">
        <p class="text-gray-400 text-sm">选择日期范围以查看日报列表</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DailyReport, PlanItem } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()
const route = useRoute()
const { showToast } = useToast()

// ========== 通用工具 ==========
function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const today = computed(() => formatLocalDate(new Date()))

// ========== 视图模式 ==========
const viewMode = ref<'single' | 'range'>('single')

// ========== 单日视图状态 ==========
const selectedDate = ref((route.query.date as string) || today.value)
const report = ref<DailyReport | null>(null)
const loading = ref(true)
const editing = ref(false)
const editContent = ref('')
const copySuccess = ref(false)
const generating = ref(false)
const deleting = ref(false)

// Carry-forward state
const showCarryForward = ref(false)
const incompleteItems = ref<PlanItem[]>([])
const carryForwardIds = ref<number[]>([])

const isToday = computed(() => selectedDate.value === today.value)

function changeDate(delta: number) {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const date = new Date(y, m - 1, d + delta)
  selectedDate.value = formatLocalDate(date)
  fetchReport()
}

function goToday() {
  selectedDate.value = today.value
  fetchReport()
}

async function copySummary() {
  if (!report.value?.auto_summary) return
  try {
    await navigator.clipboard.writeText(report.value.auto_summary)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    showToast('复制失败，请手动选择复制', 'error')
  }
}

async function fetchReport() {
  loading.value = true
  showCarryForward.value = false
  editing.value = false
  const res = await api<DailyReport>(`/api/daily-reports?date=${selectedDate.value}`)
  report.value = (res.code === 200 && res.data) ? res.data : null
  loading.value = false

  // Auto-generate if coming from plan page with ?generate=true
  if (!report.value && route.query.generate === 'true') {
    navigateTo({ path: route.path, query: { date: selectedDate.value } }, { replace: true })
    startGenerate()
  }
}

async function startGenerate() {
  if (generating.value) return
  generating.value = true
  try {
    const planRes = await api<any>(`/api/daily-plans?date=${selectedDate.value}`)
    if (planRes.code === 200 && planRes.data) {
      const items = planRes.data.plan_items || []
      const incomplete = items.filter((i: PlanItem) => !i.completed)
      if (incomplete.length > 0) {
        incompleteItems.value = incomplete
        carryForwardIds.value = []
        showCarryForward.value = true
        generating.value = false
        return
      }
    }
    await doGenerate([])
  } finally {
    generating.value = false
  }
}

async function confirmGenerate() {
  showCarryForward.value = false
  generating.value = true
  try {
    await doGenerate(carryForwardIds.value)
  } finally {
    generating.value = false
  }
}

async function doGenerate(carryIds: number[]) {
  loading.value = true
  const res = await api<DailyReport>('/api/daily-reports/generate', {
    method: 'POST',
    body: { date: selectedDate.value, carry_forward_item_ids: carryIds },
  })
  if (res.code === 200 && res.data) {
    report.value = res.data
  }
  loading.value = false
}

async function createEmptyReport() {
  if (generating.value) return
  generating.value = true
  try {
    await doGenerate([])
  } finally {
    generating.value = false
  }
}

async function refreshSummary() {
  if (generating.value) return
  generating.value = true
  try {
    await doGenerate([])
  } finally {
    generating.value = false
  }
}

async function saveContent() {
  if (!report.value) return
  const res = await api<DailyReport>(`/api/daily-reports/${report.value.id}`, {
    method: 'PUT',
    body: { content: editContent.value },
  })
  if (res.code === 200 && res.data) {
    report.value = res.data
    editing.value = false
  }
}

function cancelEdit() {
  editContent.value = report.value?.content || ''
  editing.value = false
}

async function deleteReport() {
  if (!report.value || deleting.value) return
  if (!await confirm('确定删除该日报？')) return
  deleting.value = true
  try {
    const res = await api(`/api/daily-reports/${report.value.id}`, { method: 'DELETE' })
    if (res.code === 200) report.value = null
  } finally {
    deleting.value = false
  }
}

watch(editing, (val) => {
  if (val) editContent.value = report.value?.content || ''
})

// ========== 日报列表视图状态 ==========
const rangeFrom = ref('')
const rangeTo = ref('')
const rangeReports = ref<DailyReport[]>([])
const rangeLoading = ref(false)
const batchGenerating = ref(false)
const batchResult = ref<number | null>(null)
const rangeCopySuccess = ref(false)
const activePreset = ref('')

const rangePresets = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
]

const missingReportCount = computed(() => {
  if (!rangeFrom.value || !rangeTo.value) return 0
  const from = new Date(rangeFrom.value + 'T12:00:00')
  const to = new Date(rangeTo.value + 'T12:00:00')
  if (to < from) return 0
  const totalDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1
  return Math.max(0, totalDays - rangeReports.value.length)
})

function setRangePreset(preset: string) {
  activePreset.value = preset
  const now = new Date()
  rangeTo.value = formatLocalDate(now)
  if (preset === 'year') {
    rangeFrom.value = `${now.getFullYear()}-01-01`
  } else if (preset === 'month') {
    rangeFrom.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else {
    const day = now.getDay() || 7
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
    rangeFrom.value = formatLocalDate(monday)
  }
  fetchRangeReports()
}

async function fetchRangeReports() {
  if (!rangeFrom.value || !rangeTo.value) return
  rangeLoading.value = true
  batchResult.value = null
  const res = await api<DailyReport[]>(`/api/daily-reports?from=${rangeFrom.value}&to=${rangeTo.value}`)
  rangeReports.value = (res.code === 200 && res.data) ? res.data : []
  rangeLoading.value = false
}

async function batchGenerate() {
  if (batchGenerating.value || !rangeFrom.value || !rangeTo.value) return
  batchGenerating.value = true
  const res = await api<{ generated: number; reports: DailyReport[] }>('/api/daily-reports/batch-generate', {
    method: 'POST',
    body: { from: rangeFrom.value, to: rangeTo.value },
  })
  if (res.code === 200 && res.data) {
    rangeReports.value = res.data.reports
    batchResult.value = res.data.generated
  }
  batchGenerating.value = false
}

const rangeMarkdownText = computed(() => {
  return rangeReports.value.map(r => {
    let text = r.auto_summary || `## 日报 (${r.date})`
    if (r.content) {
      text += `\n\n### 补充内容\n${r.content}`
    }
    return text
  }).join('\n\n---\n\n')
})

async function copyRangeMarkdown() {
  if (!rangeMarkdownText.value) return
  try {
    await navigator.clipboard.writeText(rangeMarkdownText.value)
    rangeCopySuccess.value = true
    setTimeout(() => { rangeCopySuccess.value = false }, 2000)
  } catch {
    showToast('复制失败，请手动选择复制', 'error')
  }
}

onMounted(fetchReport)
</script>
