import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { habitUpdateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = habitUpdateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('habits')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', event.context.user.id)
    .select()
    .single()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
