import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: habitsData, error: habitsError } = await client
    .from('habits')
    .select('*')
    .eq('user_id', event.context.user.id)
    .order('created_at')

  if (habitsError) return fail(habitsError.message)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: checks, error: checksError } = await client
    .from('habit_checks')
    .select('*')
    .eq('user_id', event.context.user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

  if (checksError) return fail(checksError.message)

  return success({ habits: habitsData, checks: checks || [] })
})
