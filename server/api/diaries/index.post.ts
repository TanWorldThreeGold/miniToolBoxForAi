import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { diarySchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = diarySchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('diaries')
    .insert({
      user_id: event.context.user.id,
      ...parsed.data,
    })
    .select()
    .single()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
