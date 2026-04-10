import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { habitCheckSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = habitCheckSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400)

  const client = await serverSupabaseClient(event)

  if (parsed.data.checked) {
    const { error } = await client
      .from('habit_checks')
      .insert({ habit_id: parsed.data.habitId, user_id: event.context.user.id, date: parsed.data.date })
    if (error) return fail(error.message)
  } else {
    const { error } = await client
      .from('habit_checks')
      .delete()
      .eq('habit_id', parsed.data.habitId)
      .eq('date', parsed.data.date)
    if (error) return fail(error.message)
  }

  return success(null)
})
