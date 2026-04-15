import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  const [todosRes, diariesRes, memosRes, expensesRes, habitsRes, habitChecksRes, pomodorosRes] = await Promise.all([
    client.from('todos').select('*').eq('user_id', userId),
    client.from('diaries').select('*').eq('user_id', userId),
    client.from('memos').select('*').eq('user_id', userId),
    client.from('expenses').select('*').eq('user_id', userId),
    client.from('habits').select('*').eq('user_id', userId),
    client.from('habit_checks').select('*').eq('user_id', userId),
    client.from('pomodoros').select('*').eq('user_id', userId),
  ])

  if (todosRes.error) return fail(todosRes.error.message, 500, event)
  if (diariesRes.error) return fail(diariesRes.error.message, 500, event)
  if (memosRes.error) return fail(memosRes.error.message, 500, event)
  if (expensesRes.error) return fail(expensesRes.error.message, 500, event)
  if (habitsRes.error) return fail(habitsRes.error.message, 500, event)
  if (habitChecksRes.error) return fail(habitChecksRes.error.message, 500, event)
  if (pomodorosRes.error) return fail(pomodorosRes.error.message, 500, event)

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      todos: todosRes.data,
      diaries: diariesRes.data,
      memos: memosRes.data,
      expenses: expensesRes.data,
      habits: habitsRes.data,
      habitChecks: habitChecksRes.data,
      pomodoros: pomodorosRes.data,
    },
  }

  return success(exportData, event)
})
