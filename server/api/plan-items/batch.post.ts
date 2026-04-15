import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { planItemBatchSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = planItemBatchSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  const items = parsed.data.items.map((item, i) => ({
    plan_id: parsed.data.plan_id,
    user_id: userId,
    title: item.title,
    sort_order: item.sort_order || i,
  }))

  const { data, error } = await client
    .from('plan_items')
    .insert(items)
    .select()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
