<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">记账</h1>

    <!-- 添加/编辑记录 -->
    <form @submit.prevent="submitExpense" class="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
      <div class="flex gap-2">
        <button
          type="button"
          @click="form.type = 'expense'"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="form.type === 'expense' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-500'"
        >
          支出
        </button>
        <button
          type="button"
          @click="form.type = 'income'"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="form.type === 'income' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-500'"
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
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          v-model="form.category"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option v-for="c in categories[form.type]" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="flex gap-2">
        <input
          v-model="form.note"
          type="text"
          placeholder="备注（可选）"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          v-model="form.date"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div class="flex gap-2">
        <button
          type="submit"
          class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          {{ editingId ? '保存修改' : '添加' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </button>
      </div>
    </form>

    <!-- 月份筛选 -->
    <div class="flex items-center gap-2 mb-4">
      <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded transition">&lt;</button>
      <span class="text-sm font-medium text-gray-700 min-w-[100px] text-center">{{ filterMonth || '全部' }}</span>
      <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded transition">&gt;</button>
      <button
        v-if="filterMonth"
        @click="filterMonth = ''"
        class="text-xs text-gray-400 hover:text-gray-600 ml-2"
      >
        显示全部
      </button>
    </div>

    <!-- 月度统计 -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500">收入</p>
        <p class="text-lg font-bold text-green-600">{{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500">支出</p>
        <p class="text-lg font-bold text-red-500">{{ totalExpense.toFixed(2) }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500">结余</p>
        <p class="text-lg font-bold" :class="balance >= 0 ? 'text-green-600' : 'text-red-500'">
          {{ balance.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="space-y-2">
      <div
        v-for="item in filteredExpenses"
        :key="item.id"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 group cursor-pointer hover:shadow-sm transition"
        @click="editExpense(item)"
      >
        <div>
          <span class="text-sm font-medium text-gray-900">{{ item.category }}</span>
          <span v-if="item.note" class="text-sm text-gray-400 ml-2">{{ item.note }}</span>
          <p class="text-xs text-gray-400 mt-0.5">{{ item.date }}</p>
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
            class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
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

const today = new Date().toISOString().split('T')[0]
const editingId = ref<number | null>(null)
const filterMonth = ref(today.slice(0, 7)) // YYYY-MM

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
