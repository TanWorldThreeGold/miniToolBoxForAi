<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">密码 & 备忘</h1>

    <!-- 密码生成器 -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <h2 class="font-medium text-gray-900 mb-3">密码生成器</h2>
      <div class="flex gap-2 mb-3">
        <input
          :value="generatedPassword"
          readonly
          class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
        />
        <button
          @click="copyPassword"
          class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          {{ copied ? '已复制' : '复制' }}
        </button>
        <button
          @click="generatePassword"
          class="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
        >
          生成
        </button>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-600">
        <label class="flex items-center gap-1">
          长度
          <input
            v-model.number="pwLength"
            type="number"
            min="8"
            max="64"
            class="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            @change="generatePassword"
          />
        </label>
        <label class="flex items-center gap-1">
          <input v-model="pwOptions.upper" type="checkbox" @change="generatePassword" /> 大写
        </label>
        <label class="flex items-center gap-1">
          <input v-model="pwOptions.numbers" type="checkbox" @change="generatePassword" /> 数字
        </label>
        <label class="flex items-center gap-1">
          <input v-model="pwOptions.symbols" type="checkbox" @change="generatePassword" /> 符号
        </label>
      </div>
    </div>

    <!-- 备忘录 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-medium text-gray-900">备忘录</h2>
      <button
        @click="addMemo"
        class="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
      >
        新建
      </button>
    </div>

    <div v-if="editingMemo" class="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
      <input
        v-model="editingMemo.title"
        type="text"
        placeholder="标题"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        v-model="editingMemo.content"
        rows="4"
        placeholder="内容..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      <div class="flex gap-2">
        <button
          @click="saveMemo"
          class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          保存
        </button>
        <button
          @click="editingMemo = null"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="m in memos"
        :key="m.id"
        class="bg-white border border-gray-200 rounded-lg px-4 py-3 group cursor-pointer hover:shadow-sm transition"
        @click="editingMemo = { ...m }"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-gray-900">{{ m.title || '无标题' }}</h3>
          <button
            @click.stop="deleteMemo(m.id)"
            class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ m.content }}</p>
      </div>
      <p v-if="memos.length === 0 && !editingMemo" class="text-gray-400 text-center py-8">
        暂无备忘录
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// 密码生成器
const pwLength = ref(16)
const pwOptions = reactive({ upper: true, numbers: true, symbols: true })
const generatedPassword = ref('')
const copied = ref(false)

function generatePassword() {
  let chars = 'abcdefghijklmnopqrstuvwxyz'
  if (pwOptions.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (pwOptions.numbers) chars += '0123456789'
  if (pwOptions.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const arr = new Uint32Array(pwLength.value)
  crypto.getRandomValues(arr)
  generatedPassword.value = Array.from(arr, v => chars[v % chars.length]).join('')
  copied.value = false
}

async function copyPassword() {
  await navigator.clipboard.writeText(generatedPassword.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// 备忘录
interface Memo {
  id?: number
  title: string
  content: string
}

const memos = ref<Memo[]>([])
const editingMemo = ref<Memo | null>(null)

function addMemo() {
  editingMemo.value = { title: '', content: '' }
}

async function saveMemo() {
  if (!editingMemo.value) return

  if (editingMemo.value.id) {
    const { data } = await supabase
      .from('memos')
      .update({ title: editingMemo.value.title, content: editingMemo.value.content, updated_at: new Date().toISOString() })
      .eq('id', editingMemo.value.id)
      .select()
      .single()
    if (data) {
      const idx = memos.value.findIndex(m => m.id === data.id)
      if (idx !== -1) memos.value[idx] = data
    }
  } else {
    const { data } = await supabase
      .from('memos')
      .insert({
        user_id: user.value!.id,
        title: editingMemo.value.title,
        content: editingMemo.value.content,
      })
      .select()
      .single()
    if (data) memos.value.unshift(data)
  }
  editingMemo.value = null
}

async function deleteMemo(id: number | undefined) {
  if (!id) return
  memos.value = memos.value.filter(m => m.id !== id)
  await supabase.from('memos').delete().eq('id', id)
}

async function fetchMemos() {
  const { data } = await supabase
    .from('memos')
    .select('*')
    .eq('user_id', user.value!.id)
    .order('updated_at', { ascending: false })
  memos.value = data || []
}

onMounted(() => {
  generatePassword()
  fetchMemos()
})
</script>
