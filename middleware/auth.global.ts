export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = ['/login', '/calculator', '/currency']
  if (publicPages.includes(to.path)) return

  const user = useSupabaseUser()

  // 已登录，直接放行
  if (user.value) return

  // SPA 模式刷新时 session 还没恢复，等 Supabase client 初始化完成
  const client = useSupabaseClient()
  const { data } = await client.auth.getSession()

  if (!data.session) {
    return navigateTo('/login')
  }
})
