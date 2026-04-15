import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { todoCreateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = todoCreateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.errors[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('todos')
    .insert({
      title: parsed.data.title,
      user_id: event.context.user.id,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date,
      parent_id: parsed.data.parent_id,
    })
    .select()
    .single()

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
