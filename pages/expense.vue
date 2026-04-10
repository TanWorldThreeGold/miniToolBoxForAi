<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">记账</h1>

    <!-- 添加记录 -->
    <form @submit.prevent="addExpense" class="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
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
      <button
        type="submit"
        class="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
      >
        添加
      </button>
    </form>

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
        v-for="item in expenses"
        :key="item.id"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 group"
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
            @click="deleteExpense(item.id)"
            class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-if="expenses.length === 0" class="text-gray-400 text-center py-8">暂无记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const categories = {
  expense: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他'],
  income: ['工资', '兼职', '投资', '红包', '其他'],
}

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  type: 'expense' as 'expense' | 'income',
  amount: null as number | null,
  category: '餐饮',
  note: '',
  date: today,
})

interface Expense {
  id: number
  type: string
  amount: number
  category: string
  note: string
  date: string
}

const expenses = ref<Expense[]>([])

const totalIncome = computed(() =>
  expenses.value.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
)
const totalExpense = computed(() =>
  expenses.value.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
)
const balance = computed(() => totalIncome.value - totalExpense.value)

watch(() => form.type, (t) => {
  form.category = categories[t][0]
})

async function fetchExpenses() {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.value!.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  expenses.value = data || []
}

async function addExpense() {
  if (!form.amount) return
  const { data } = await supabase
    .from('expenses')
    .insert({
      user_id: user.value!.id,
      type: form.type,
      amount: form.amount,
      category: form.category,
      note: form.note,
      date: form.date,
    })
    .select()
    .single()
  if (data) {
    expenses.value.unshift(data)
    form.amount = null
    form.note = ''
  }
}

async function deleteExpense(id: number) {
  expenses.value = expenses.value.filter(e => e.id !== id)
  await supabase.from('expenses').delete().eq('id', id)
}

onMounted(fetchExpenses)
</script>
