import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { countdownSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = countdownSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('countdowns')
    .insert({
      user_id: event.context.user.id,
      title: parsed.data.title,
      date: parsed.data.date,
    })
    .select()
    .single()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
