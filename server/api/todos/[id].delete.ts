import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)
  const { error } = await client
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', event.context.user.id)

  if (error) return fail(error.message, 500, event)
  return success(null, event)
})
