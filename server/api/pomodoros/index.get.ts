import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const today = new Date().toISOString().split('T')[0]
  const client = await serverSupabaseClient(event)

  const [countResult, historyResult] = await Promise.all([
    client
      .from('pomodoros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', event.context.user.id)
      .gte('created_at', today),
    client
      .from('pomodoros')
      .select('*')
      .eq('user_id', event.context.user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (countResult.error) return fail(countResult.error.message)
  if (historyResult.error) return fail(historyResult.error.message)

  return success({
    count: countResult.count || 0,
    history: historyResult.data || [],
  })
})
