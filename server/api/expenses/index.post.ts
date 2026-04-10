import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { expenseCreateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = expenseCreateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('expenses')
    .insert({
      user_id: event.context.user.id,
      ...parsed.data,
    })
    .select()
    .single()

  if (error) return fail(error.message)
  return success(data)
})
