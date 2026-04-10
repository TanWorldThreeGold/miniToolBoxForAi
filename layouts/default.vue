<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-lg font-semibold text-gray-900 hover:text-gray-600 transition">
            ToolBox
          </NuxtLink>
          <nav class="hidden sm:flex items-center gap-1">
            <NuxtLink
              v-for="item in pcNavItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-1.5 rounded-lg text-sm transition"
              :class="route.path === item.to ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
            >
              {{ item.icon }} {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:inline">{{ user?.email }}</span>
          <button
            v-if="user"
            @click="handleLogout"
            class="text-sm text-gray-500 hover:text-gray-900 transition"
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

    <nav v-if="showBottomNav" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden">
      <div class="flex justify-around py-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition"
          :class="route.path === item.to ? 'text-gray-900' : 'text-gray-400'"
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
]

const showBottomNav = computed(() => {
  const hiddenPaths = ['/login']
  return !hiddenPaths.includes(route.path)
})

async function handleLogout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
