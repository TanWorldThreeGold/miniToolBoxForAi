import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  if (query.date) {
    const { data, error } = await client
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('date', query.date)
      .single()

    if (error && error.code === 'PGRST116') return success(null, event)
    if (error) return fail(error.message, 500, event)
    return success(data, event)
  }

  // Range query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
  if (query.from && query.to) {
    const { data, error } = await client
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .gte('date', query.from)
      .lte('date', query.to)
      .order('date', { ascending: true })

    if (error) return fail(error.message, 500, event)
    return success(data, event)
  }

  const { data, error } = await client
    .from('daily_reports')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
