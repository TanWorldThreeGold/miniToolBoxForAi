<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">密码生成器</h1>

    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">生成的密码</label>
        <div class="flex gap-2">
          <input
            :value="password"
            readonly
            class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg text-gray-900 dark:text-white"
          />
          <button
            @click="copyPassword"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">长度: {{ length }}</label>
        <input
          v-model.number="length"
          type="range"
          min="8"
          max="32"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input v-model="options.uppercase" type="checkbox" class="rounded" @change="generatePassword" />
          大写字母 (A-Z)
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input v-model="options.lowercase" type="checkbox" class="rounded" @change="generatePassword" />
          小写字母 (a-z)
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input v-model="options.numbers" type="checkbox" class="rounded" @change="generatePassword" />
          数字 (0-9)
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input v-model="options.symbols" type="checkbox" class="rounded" @change="generatePassword" />
          特殊符号 (!@#$%^&*)
        </label>
      </div>

      <button
        @click="generatePassword"
        class="w-full py-3 bg-accent text-white rounded-lg hover:opacity-90 transition font-medium"
      >
        生成新密码
      </button>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          密码强度: <span :class="strengthClass">{{ strengthText }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const copied = ref(false)
const length = ref(16)

const options = reactive({
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
})

const charsets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

const strength = computed(() => {
  let score = 0
  if (length.value >= 12) score++
  if (length.value >= 16) score++
  if (options.uppercase) score++
  if (options.lowercase) score++
  if (options.numbers) score++
  if (options.symbols) score++
  return score
})

const strengthText = computed(() => {
  if (strength.value <= 2) return '弱'
  if (strength.value <= 4) return '中等'
  return '强'
})

const strengthClass = computed(() => {
  if (strength.value <= 2) return 'text-red-500'
  if (strength.value <= 4) return 'text-yellow-500'
  return 'text-green-500'
})

function generatePassword() {
  let charset = ''
  if (options.uppercase) charset += charsets.uppercase
  if (options.lowercase) charset += charsets.lowercase
  if (options.numbers) charset += charsets.numbers
  if (options.symbols) charset += charsets.symbols

  if (!charset) {
    charset = charsets.lowercase
    options.lowercase = true
  }

  let result = ''
  const array = new Uint32Array(length.value)
  crypto.getRandomValues(array)
  for (let i = 0; i < length.value; i++) {
    result += charset[array[i] % charset.length]
  }
  password.value = result
  copied.value = false
}

async function copyPassword() {
  if (!password.value) return
  await navigator.clipboard.writeText(password.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(generatePassword)
</script>
