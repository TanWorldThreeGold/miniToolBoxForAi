<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">记账</h1>

    <form @submit.prevent="submitExpense" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 space-y-3">
      <div class="flex gap-2">
        <button
          type="button"
          @click="form.type = 'expense'"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="form.type === 'expense' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
        >
          支出
        </button>
        <button
          type="button"
          @click="form.type = 'income'"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="form.type === 'income' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
        >
          收入
        </button>
      </div>
      <div class="flex gap-2">
        <input
          v-model.number="form.amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="金额"
          required
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          v-model="form.category"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option v-for="c in categories[form.type]" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="flex gap-2">
        <input
          v-model="form.note"
          type="text"
          placeholder="备注（可选）"
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          v-model="form.date"
          type="date"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div class="flex gap-2">
        <button
          type="submit"
          class="flex-1 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition"
        >
          {{ editingId ? '保存修改' : '添加' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          取消
        </button>
      </div>
    </form>

    <div class="flex items-center gap-2 mb-4">
      <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-gray-600 dark:text-gray-300">&lt;</button>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[100px] text-center">{{ filterMonth || '全部' }}</span>
      <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-gray-600 dark:text-gray-300">&gt;</button>
      <button
        v-if="filterMonth"
        @click="filterMonth = ''"
        class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
      >
        显示全部
      </button>
      <button
        @click="exportData"
        class="ml-auto text-xs text-accent hover:underline"
      >
        导出CSV
      </button>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">收入</p>
        <p class="text-lg font-bold text-green-600">{{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">支出</p>
        <p class="text-lg font-bold text-red-500">{{ totalExpense.toFixed(2) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">结余</p>
        <p class="text-lg font-bold" :class="balance >= 0 ? 'text-green-600' : 'text-red-500'">
          {{ balance.toFixed(2) }}
        </p>
      </div>
    </div>

    <div v-if="categoryStats.length > 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">支出分类</h3>
      <div class="space-y-2">
        <div v-for="cat in categoryStats" :key="cat.name" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-300 w-16">{{ cat.name }}</span>
          <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: cat.percent + '%', backgroundColor: cat.color }"
            ></div>
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400 w-20 text-right">{{ cat.amount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="item in filteredExpenses"
        :key="item.id"
        class="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 group cursor-pointer hover:shadow-sm transition"
        @click="editExpense(item)"
      >
        <div>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.category }}</span>
          <span v-if="item.note" class="text-sm text-gray-400 dark:text-gray-500 ml-2">{{ item.note }}</span>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ item.date }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="font-medium"
            :class="item.type === 'income' ? 'text-green-600' : 'text-red-500'"
          >
            {{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}
          </span>
          <button
            @click.stop="deleteExpense(item.id)"
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="filteredExpenses.length === 0" class="text-gray-400 text-center py-8">暂无记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const categories = {
  expense: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他'],
  income: ['工资', '兼职', '投资', '红包', '其他'],
}

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

const today = new Date().toISOString().split('T')[0]
const editingId = ref<number | null>(null)
const filterMonth = ref(today.slice(0, 7))

const form = reactive({
  type: 'expense' as 'expense' | 'income',
  amount: null as number | null,
  category: '餐饮',
  note: '',
  date: today,
})

const expenses = ref<Expense[]>([])
const loading = ref(true)

const filteredExpenses = computed(() => {
  if (!filterMonth.value) return expenses.value
  return expenses.value.filter(e => e.date.startsWith(filterMonth.value))
})

const totalIncome = computed(() =>
  filteredExpenses.value.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
)
const totalExpense = computed(() =>
  filteredExpenses.value.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
)
const balance = computed(() => totalIncome.value - totalExpense.value)

const categoryStats = computed(() => {
  const expenseItems = filteredExpenses.value.filter(e => e.type === 'expense')
  if (expenseItems.length === 0) return []

  const grouped: Record<string, number> = {}
  expenseItems.forEach(e => {
    grouped[e.category] = (grouped[e.category] || 0) + Number(e.amount)
  })

  const total = Object.values(grouped).reduce((a, b) => a + b, 0)
  return Object.entries(grouped)
    .map(([name, amount], i) => ({
      name,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount)
})

watch(() => form.type, (t) => {
  form.category = categories[t][0]
})

function changeMonth(delta: number) {
  const d = filterMonth.value ? new Date(filterMonth.value + '-01') : new Date()
  d.setMonth(d.getMonth() + delta)
  filterMonth.value = d.toISOString().split('T')[0].slice(0, 7)
}

function editExpense(item: Expense) {
  editingId.value = item.id
  form.type = item.type as 'expense' | 'income'
  form.amount = item.amount
  form.category = item.category
  form.note = item.note
  form.date = item.date
}

function cancelEdit() {
  editingId.value = null
  form.amount = null
  form.note = ''
  form.date = today
  form.type = 'expense'
  form.category = '餐饮'
}

function exportData() {
  const data = filteredExpenses.value.map(e => ([
    e.date,
    e.type === 'income' ? '收入' : '支出',
    e.category,
    String(e.amount),
    `"${(e.note || '').replace(/"/g, '""')}"`,
  ]))
  const headers = '日期,类型,分类,金额,备注'
  const rows = data.map(d => d.join(',')).join('\n')
  const csv = headers + '\n' + rows
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-${filterMonth.value || 'all'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function fetchExpenses() {
  loading.value = true
  const res = await api<Expense[]>('/api/expenses')
  if (res.code === 200) expenses.value = res.data || []
  loading.value = false
}

async function submitExpense() {
  if (!form.amount) return
  const body = { type: form.type, amount: form.amount, category: form.category, note: form.note, date: form.date }

  if (editingId.value) {
    const res = await api<Expense>('/api/expenses/' + editingId.value, { method: 'PUT', body })
    if (res.code === 200 && res.data) {
      const idx = expenses.value.findIndex(e => e.id === editingId.value)
      if (idx !== -1) expenses.value[idx] = res.data
      cancelEdit()
    }
  } else {
    const res = await api<Expense>('/api/expenses', { method: 'POST', body })
      if (res.code === 200 && res.data) {
        expenses.value.unshift(res.data)
        form.amount = null
        form.note = ''
        form.type = 'expense'
        form.category = '餐饮'
        form.date = today
      }
  }
}

async function deleteExpense(id: number) {
  if (!await confirm('确定删除这条记录？')) return
  const prev = expenses.value
  expenses.value = expenses.value.filter(e => e.id !== id)
  const res = await api('/api/expenses/' + id, { method: 'DELETE' })
  if (res.code !== 200) expenses.value = prev
}

onMounted(fetchExpenses)
</script>
