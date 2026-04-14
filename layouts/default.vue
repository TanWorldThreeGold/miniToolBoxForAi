<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-12 flex items-center gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0">
          ToolBox
        </NuxtLink>

        <!-- PC 导航（可横向滚动） -->
        <nav ref="navRef" class="hidden sm:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto nav-scroll">
          <NuxtLink
            v-for="item in pcNavItems"
            :key="item.to"
            :to="item.to"
            class="px-2.5 py-1 rounded-md text-[13px] whitespace-nowrap transition shrink-0"
            :class="route.path === item.to ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'"
          >
            {{ item.icon }} {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- 右侧用户区 -->
        <div class="flex items-center gap-2 shrink-0 ml-auto">
          <template v-if="user">
            <span class="text-xs text-gray-400 hidden lg:inline max-w-[160px] truncate">{{ user.email }}</span>
            <NuxtLink to="/settings" class="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="设置">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </NuxtLink>
            <button @click="handleLogout" class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="退出">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </template>
          <NuxtLink v-else to="/login" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">登录</NuxtLink>
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

    <!-- 回到顶部 -->
    <Transition name="fade">
      <button
        v-if="showBackTop"
        @click="scrollToTop"
        class="fixed z-50 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:shadow-xl transition-all"
        :class="showBottomNav ? 'bottom-20 right-4 sm:bottom-8 sm:right-8' : 'bottom-8 right-4 sm:right-8'"
        title="回到顶部"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
      </button>
    </Transition>

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
  { to: '/daily-plan', icon: '📋', label: '日计划' },
  { to: '/todo', icon: '✅', label: 'TODO' },
  { to: '/expense', icon: '💰', label: '记账' },
  { to: '/diary', icon: '📝', label: '日记' },
  { to: '/pomodoro', icon: '🍅', label: '番茄钟' },
]

const pcNavItems = [
  { to: '/daily-plan', icon: '📋', label: '日计划' },
  { to: '/daily-report', icon: '📊', label: '日报' },
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
  { to: '/countdown', icon: '⏳', label: '倒计时' },
]

const showBottomNav = computed(() => {
  const hiddenPaths = ['/login']
  return !hiddenPaths.includes(route.path)
})

// 导航鼠标滚轮横向滚动
const navRef = ref<HTMLElement | null>(null)

function onNavWheel(e: WheelEvent) {
  const el = navRef.value
  if (!el) return
  if (el.scrollWidth <= el.clientWidth) return
  e.preventDefault()
  el.scrollLeft += e.deltaY || e.deltaX
}

const showBackTop = ref(false)

function onScroll() {
  showBackTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  navRef.value?.addEventListener('wheel', onNavWheel, { passive: false })

  const theme = localStorage.getItem('theme')
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  navRef.value?.removeEventListener('wheel', onNavWheel)
})

async function handleLogout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 完全隐藏滚动条，通过鼠标滚轮/触控板滑动 */
.nav-scroll {
  scrollbar-width: none;
}
.nav-scroll::-webkit-scrollbar {
  display: none;
}
</style>
