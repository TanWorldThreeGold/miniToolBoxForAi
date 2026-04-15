import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  if (query.date) {
    const { data, error } = await client
      .from('daily_plans')
      .select('*, plan_items(*)')
      .eq('user_id', userId)
      .eq('date', query.date)
      .single()

    if (error && error.code === 'PGRST116') return success(null, event)
    if (error) return fail(error.message, 500, event)
    if (data?.plan_items) {
      data.plan_items.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }
    return success(data, event)
  }

  const { data, error } = await client
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
