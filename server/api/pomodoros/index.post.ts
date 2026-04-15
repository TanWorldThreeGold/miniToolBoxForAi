import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { pomodoroCreateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = pomodoroCreateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('pomodoros')
    .insert({ user_id: event.context.user.id, duration: parsed.data.duration })
    .select()
    .single()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
