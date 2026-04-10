import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

interface ImportData {
  version: string
  data: {
    todos?: any[]
    diaries?: any[]
    memos?: any[]
    expenses?: any[]
    habits?: any[]
    habitChecks?: any[]
    pomodoros?: any[]
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id

  const importData: ImportData = body

  if (!importData.version || !importData.data) {
    return fail('无效的导入数据格式', 400)
  }

  const results: Record<string, { success: number; failed: number }> = {}

  const tables = ['todos', 'diaries', 'memos', 'expenses', 'habits', 'habitChecks', 'pomodoros'] as const

  for (const table of tables) {
    const items = importData.data[table]
    if (!items || items.length === 0) {
      results[table] = { success: 0, failed: 0 }
      continue
    }

    const dataToInsert = items.map((item: any) => {
      const { id, user_id, created_at, updated_at, ...rest } = item
      return { ...rest, user_id: userId }
    })

    const { error } = await client.from(table).insert(dataToInsert)
    results[table] = {
      success: error ? 0 : items.length,
      failed: error ? items.length : 0,
    }
  }

  return success(results)
})
