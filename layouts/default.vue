<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg font-semibold text-gray-900 hover:text-gray-600 transition">
          ToolBox
        </NuxtLink>
        <div class="flex items-center gap-3">
          <template v-if="user">
            <span class="text-sm text-gray-500 hidden sm:inline">{{ user.email }}</span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              退出
            </button>
          </template>
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
    <main class="max-w-5xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function handleLogout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
