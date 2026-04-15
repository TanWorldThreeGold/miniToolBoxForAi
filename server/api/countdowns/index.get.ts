import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { z } from 'zod'

const countdownSchema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('countdowns')
    .select('*')
    .eq('user_id', event.context.user.id)
    .order('created_at', { ascending: false })

  if (error) return fail(error.message, 500, event)
  return success(data, event)
})
