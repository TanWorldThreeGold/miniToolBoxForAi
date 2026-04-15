import type { ApiResponse } from '~/server/utils/response'

export function useApi() {
  const { showToast } = useToast()

  async function api<T>(url: string, options?: Parameters<typeof $fetch>[1]): Promise<ApiResponse<T>> {
    try {
      const res = await $fetch<ApiResponse<T>>(url, options)
      if (res.code === 401) {
        showToast('登录已过期，请重新登录', 'error')
        const client = useSupabaseClient()
        await client.auth.signOut()
        navigateTo('/login')
        return res
      }
      if (res.code !== 200) {
        showToast(`${res.message} [${res.traceId}]`, 'error')
      }
      return res
    } catch (e: any) {
      const traceId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const message = e?.data?.message || e?.message || '网络错误'
      showToast(`${message} [${traceId}]`, 'error')
      console.error(`[${traceId}]`, e)
      return { code: 500, data: null, message, traceId }
    }
  }

  return { api }
}
