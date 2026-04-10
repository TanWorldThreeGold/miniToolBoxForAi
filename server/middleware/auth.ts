import { serverSupabaseUser } from '#supabase/server'
import { fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return

  const user = await serverSupabaseUser(event)
  if (!user) {
    setResponseStatus(event, 401)
    return fail('未登录', 401)
  }
  event.context.user = user
})
