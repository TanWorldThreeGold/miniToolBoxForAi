import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('memos')
    .select('*')
    .eq('user_id', event.context.user.id)
    .order('updated_at', { ascending: false })

  if (error) return fail(error.message)
  return success(data)
})
