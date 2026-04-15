<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">设置</h1>

    <div class="space-y-6">
      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">开发者</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-700 dark:text-gray-200">API 文档</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">查看接口文档和 Schema 定义</p>
          </div>
          <NuxtLink
            to="/api-docs"
            class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            查看
          </NuxtLink>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">数据管理</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-200">导出数据</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">将所有数据导出为 JSON 文件</p>
            </div>
            <button
              @click="handleExport"
              :disabled="exporting"
              class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition"
            >
              {{ exporting ? '导出中...' : '导出' }}
            </button>
          </div>
          <hr class="border-gray-200 dark:border-gray-700" />
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-200">导入数据</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">从 JSON 文件恢复数据</p>
            </div>
            <label class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer transition">
              {{ importing ? '导入中...' : '导入' }}
              <input
                type="file"
                accept=".json"
                class="hidden"
                @change="handleImport"
                :disabled="importing"
              />
            </label>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">开发者</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-700 dark:text-gray-200">API 文档</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">查看接口文档和 Schema 定义</p>
          </div>
          <NuxtLink
            to="/api-docs"
            class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            查看
          </NuxtLink>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">开发者</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-700 dark:text-gray-200">API 文档</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">查看接口文档和 Schema 定义</p>
          </div>
          <NuxtLink
            to="/api-docs"
            class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            查看
          </NuxtLink>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">主题设置</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-700 dark:text-gray-200">深色模式</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">切换深色/浅色主题</p>
          </div>
          <button
            @click="toggleTheme"
            class="relative w-12 h-6 rounded-full transition-colors"
            :class="isDark ? 'bg-gray-900 dark:bg-gray-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
              :class="isDark ? 'translate-x-7' : 'translate-x-1'"
            />
          </button>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">开发者</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-700 dark:text-gray-200">API 文档</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">查看接口文档和 Schema 定义</p>
          </div>
          <NuxtLink
            to="/api-docs"
            class="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            查看
          </NuxtLink>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">账户信息</h2>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-300">邮箱：{{ user?.email }}</p>
          <button
            @click="handleLogout"
            class="text-sm text-red-500 hover:text-red-600 transition"
          >
            退出登录
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { success: toastSuccess, error: toastError } = useToast()

const exporting = ref(false)
const importing = ref(false)
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

async function handleExport() {
  exporting.value = true
  try {
    const res = await $fetch('/api/export')
    if (res.code !== 200) {
      toastError(res.message)
      return
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `toolbox-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toastSuccess('导出成功')
  } catch (e: any) {
    toastError(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    const res = await $fetch('/api/import', {
      method: 'POST',
      body: data,
    })

    if (res.code !== 200) {
      toastError(res.message)
      return
    }

    toastSuccess('导入成功')
  } catch (e: any) {
    toastError(e.message || '导入失败')
  } finally {
    importing.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function handleLogout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
