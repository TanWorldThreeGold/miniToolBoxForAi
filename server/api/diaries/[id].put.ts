import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { diarySchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = diarySchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('diaries')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', event.context.user.id)
    .select()
    .single()

  if (error) return fail(error.message)
  return success(data)
})
