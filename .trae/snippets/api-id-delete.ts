import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)
  const { error } = await client
    .from('TABLE_NAME')
    .delete()
    .eq('id', id)
    .eq('user_id', event.context.user.id)

  if (error) return fail(error.message)
  return success(null)
})
