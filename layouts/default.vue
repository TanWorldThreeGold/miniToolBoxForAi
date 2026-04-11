<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition">
            ToolBox
          </NuxtLink>
          <nav class="hidden sm:flex items-center gap-1">
            <NuxtLink
              v-for="item in pcNavItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-1.5 rounded-lg text-sm transition"
              :class="route.path === item.to ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              {{ item.icon }} {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="user"
            to="/settings"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ⚙️ 设置
          </NuxtLink>
          <span class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{{ user?.email }}</span>
          <button
            v-if="user"
            @click="handleLogout"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            退出
          </button>
          <NuxtLink
            v-else
            to="/login"
            class="text-sm text-accent hover:underline"
          >
            登录
          </NuxtLink>
        </div>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      <slot />
    </main>

    <nav v-if="showBottomNav" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 sm:hidden">
      <div class="flex justify-around py-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition"
          :class="route.path === item.to ? 'text-gray-900 dark:text-white' : 'text-gray-400'"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()

const navItems = [
  { to: '/', icon: '🏠', label: '首页' },
  { to: '/todo', icon: '✅', label: 'TODO' },
  { to: '/expense', icon: '💰', label: '记账' },
  { to: '/diary', icon: '📝', label: '日记' },
  { to: '/pomodoro', icon: '🍅', label: '番茄钟' },
]

const pcNavItems = [
  { to: '/todo', icon: '✅', label: 'TODO' },
  { to: '/expense', icon: '💰', label: '记账' },
  { to: '/diary', icon: '📝', label: '日记' },
  { to: '/memo', icon: '🔑', label: '备忘' },
  { to: '/habits', icon: '🎯', label: '习惯' },
  { to: '/pomodoro', icon: '🍅', label: '番茄钟' },
  { to: '/calculator', icon: '🧮', label: '计算器' },
  { to: '/currency', icon: '💱', label: '汇率' },
  { to: '/password-generator', icon: '🔐', label: '密码' },
  { to: '/unit-converter', icon: '📏', label: '单位' },
  { to: '/qrcode', icon: '📱', label: '二维码' },
  { to: '/countdown', icon: '📅', label: '倒计时' },
]

const showBottomNav = computed(() => {
  const hiddenPaths = ['/login']
  return !hiddenPaths.includes(route.path)
})

onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
})

async function handleLogout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
