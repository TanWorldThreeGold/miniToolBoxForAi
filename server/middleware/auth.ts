import { serverSupabaseUser } from '#supabase/server'
import { fail } from '~/server/utils/response'

const publicPaths = ['/api/health', '/api/docs']

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return
  if (publicPaths.some(p => event.path === p)) return

  const user = await serverSupabaseUser(event)
  if (!user) {
    setResponseStatus(event, 401)
    return fail('未登录', 401, event)
  }
  event.context.user = user
})
