import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { planItemCreateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = planItemCreateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('plan_items')
    .insert({
      plan_id: parsed.data.plan_id,
      user_id: event.context.user.id,
      title: parsed.data.title,
      sort_order: parsed.data.sort_order,
    })
    .select()
    .single()

  if (error) return fail(error.message)
  return success(data)
})
