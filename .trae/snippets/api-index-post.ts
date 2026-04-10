import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { SCHEMA_NAME } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = SCHEMA_NAME.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('TABLE_NAME')
    .insert({ ...parsed.data, user_id: event.context.user.id })
    .select()
    .single()

  if (error) return fail(error.message)
  return success(data)
})
