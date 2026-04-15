import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { dailyPlanCreateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = dailyPlanCreateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  // Create plan
  const { data: plan, error: planError } = await client
    .from('daily_plans')
    .insert({ user_id: userId, date: parsed.data.date, note: parsed.data.note })
    .select()
    .single()

  if (planError) {
    if (planError.code === '23505') return fail('该日期已有计划，请编辑现有计划', 400, event)
    return fail(planError.message, 500, event)
  }

  // Insert items
  const items = parsed.data.items.map((item, i) => ({
    plan_id: plan.id,
    user_id: userId,
    title: item.title,
    sort_order: item.sort_order || i,
  }))

  const { data: planItems, error: itemsError } = await client
    .from('plan_items')
    .insert(items)
    .select()

  if (itemsError) return fail(itemsError.message, 500, event)

  return success({ ...plan, plan_items: planItems }, event)
})
