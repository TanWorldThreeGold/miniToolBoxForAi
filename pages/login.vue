<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-bold text-gray-900 text-center mb-8">
        {{ isRegister ? '注册' : '登录' }} ToolBox
      </h1>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="至少6位"
          />
        </div>
        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>
      <p class="text-center text-sm text-gray-500 mt-4">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <button @click="toggleMode" class="text-accent hover:underline">
          {{ isRegister ? '去登录' : '去注册' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isRegister = ref(false)

function toggleMode() {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
  successMsg.value = ''
}

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const hashed = await hashPassword(password.value)

  if (isRegister.value) {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: hashed,
    })
    if (error) {
      errorMsg.value = error.message
    } else {
      successMsg.value = '注册成功！请检查邮箱确认链接。'
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: hashed,
    })
    if (error) {
      errorMsg.value = error.message
    } else {
      navigateTo('/')
    }
  }

  loading.value = false
}
</script>
