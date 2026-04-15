<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">密码 & 备忘</h1>

    <!-- 密码生成器 -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
      <h2 class="font-medium text-gray-900 dark:text-white mb-3">密码生成器</h2>
      <div class="flex gap-2 mb-3">
        <input
          :value="generatedPassword"
          readonly
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white"
        />
        <button
          @click="copyPassword"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-gray-700 dark:text-gray-200"
        >
          {{ copied ? '已复制' : '复制' }}
        </button>
        <button
          @click="generatePassword"
          class="px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition text-sm"
        >
          生成
        </button>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
        <label class="flex items-center gap-1">
          长度
          <input
            v-model.number="pwLength"
            type="number"
            min="8"
            max="64"
            class="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
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
      <h2 class="font-medium text-gray-900 dark:text-white">备忘录</h2>
      <button
        @click="addMemo"
        class="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition text-sm"
      >
        新建
      </button>
    </div>

    <div v-if="editingMemo" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 space-y-3">
      <input
        v-model="editingMemo.title"
        type="text"
        placeholder="标题"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        v-model="editingMemo.content"
        rows="4"
        placeholder="内容..."
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input v-model="editingMemo.encrypted" type="checkbox" />
        加密存储（需设置密码）
      </label>
      <div v-if="editingMemo.encrypted" class="flex gap-2">
        <input
          v-model="encryptPassword"
          type="password"
          placeholder="设置加密密码"
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm text-gray-900 dark:text-white"
        />
      </div>
      <div class="flex gap-2">
        <button
          @click="saveMemo"
          class="flex-1 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
        >
          保存
        </button>
        <button
          @click="editingMemo = null"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 解密密码输入弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="decryptPrompt" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/30" @click="decryptPrompt = null" />
          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p class="text-gray-900 dark:text-white font-medium">输入解密密码</p>
            <input
              v-model="decryptInput"
              type="password"
              placeholder="密码"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              @keyup.enter="doDecrypt"
            />
            <p v-if="decryptError" class="text-sm text-red-500">密码错误</p>
            <div class="flex gap-3">
              <button @click="decryptPrompt = null" class="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">取消</button>
              <button @click="doDecrypt" class="flex-1 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition">解密</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="space-y-2">
      <div
        v-for="m in memos"
        :key="m.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 group cursor-pointer hover:shadow-sm transition"
        @click="openMemo(m)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span v-if="m.encrypted" class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">加密</span>
            <h3 class="font-medium text-gray-900 dark:text-white">{{ m.title || '无标题' }}</h3>
          </div>
          <button
            @click.stop="deleteMemo(m.id)"
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {{ m.encrypted ? '******' : m.content }}
        </p>
      </div>
      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="memos.length === 0 && !editingMemo" class="text-gray-400 text-center py-8">
        暂无备忘录
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Memo } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()
const { encrypt, decrypt } = useMemoEncrypt()

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
const memos = ref<Memo[]>([])
const editingMemo = ref<Memo | null>(null)
const loading = ref(true)
const encryptPassword = ref('')

// 解密弹窗
const decryptPrompt = ref<Memo | null>(null)
const decryptInput = ref('')
const decryptError = ref(false)

function addMemo() {
  editingMemo.value = { title: '', content: '', encrypted: false }
  encryptPassword.value = ''
}

function openMemo(m: Memo) {
  if (m.encrypted) {
    decryptPrompt.value = m
    decryptInput.value = ''
    decryptError.value = false
  } else {
    editingMemo.value = { ...m }
    encryptPassword.value = ''
  }
}

async function doDecrypt() {
  if (!decryptPrompt.value || !decryptInput.value) return
  try {
    const plainContent = await decrypt(decryptPrompt.value.content, decryptInput.value)
    editingMemo.value = { ...decryptPrompt.value, content: plainContent }
    encryptPassword.value = decryptInput.value
    decryptPrompt.value = null
    decryptError.value = false
  } catch {
    decryptError.value = true
  }
}

async function saveMemo() {
  if (!editingMemo.value) return

  let content = editingMemo.value.content
  const isEncrypted = editingMemo.value.encrypted || false

  if (isEncrypted) {
    if (!encryptPassword.value) {
      const { showError } = useToast()
      showError('请设置加密密码')
      return
    }
    content = await encrypt(content, encryptPassword.value)
  }

  const body = { title: editingMemo.value.title, content, encrypted: isEncrypted }

  if (editingMemo.value.id) {
    const res = await api<Memo>('/api/memos/' + editingMemo.value.id, { method: 'PUT', body })
    if (res.code === 200 && res.data) {
      const idx = memos.value.findIndex(m => m.id === res.data!.id)
      if (idx !== -1) memos.value[idx] = res.data
    }
  } else {
    const res = await api<Memo>('/api/memos', { method: 'POST', body })
    if (res.code === 200 && res.data) memos.value.unshift(res.data)
  }
  editingMemo.value = null
  encryptPassword.value = ''
}

async function deleteMemo(id: number | undefined) {
  if (!id) return
  if (!await confirm('确定删除这条备忘录？')) return
  const prev = memos.value
  memos.value = memos.value.filter(m => m.id !== id)
  const res = await api('/api/memos/' + id, { method: 'DELETE' })
  if (res.code !== 200) memos.value = prev
}

async function fetchMemos() {
  loading.value = true
  const res = await api<Memo[]>('/api/memos')
  if (res.code === 200) memos.value = res.data || []
  loading.value = false
}

onMounted(() => {
  generatePassword()
  fetchMemos()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
