import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { reportBatchGenerateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = reportBatchGenerateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id
  const { from, to } = parsed.data

  // Validate range
  const fromDate = new Date(from + 'T12:00:00')
  const toDate = new Date(to + 'T12:00:00')
  if (toDate < fromDate) return fail('结束日期不能早于起始日期', 400, event)
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000)
  if (diffDays > 366) return fail('日期范围不能超过一年', 400, event)

  // 1. Get existing reports in range
  const { data: existing } = await client
    .from('daily_reports')
    .select('date')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)

  const existingDates = new Set((existing || []).map((r: any) => r.date))

  // 2. Generate all dates in range
  const allDates: string[] = []
  const cursor = new Date(from + 'T12:00:00')
  const end = new Date(to + 'T12:00:00')
  while (cursor <= end) {
    allDates.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`)
    cursor.setDate(cursor.getDate() + 1)
  }

  const missingDates = allDates.filter(d => !existingDates.has(d))

  if (missingDates.length === 0) {
    const { data } = await client
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })
    return success({ generated: 0, reports: data }, event)
  }

  // 3. Fetch all plans for missing dates
  const { data: plans } = await client
    .from('daily_plans')
    .select('*, plan_items(*)')
    .eq('user_id', userId)
    .in('date', missingDates)

  const planMap = new Map((plans || []).map((p: any) => [p.date, p]))

  // 4. Build report rows
  const newReports = missingDates.map(date => {
    const plan = planMap.get(date)
    let autoSummary = ''
    let planId: number | null = null

    if (plan) {
      planId = plan.id
      const items = (plan.plan_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      const completed = items.filter((i: any) => i.completed)
      const incomplete = items.filter((i: any) => !i.completed)
      const total = items.length

      if (total === 0) {
        autoSummary = `## 日计划完成情况 (${date})\n\n计划为空。`
      } else {
        const rate = Math.round((completed.length / total) * 100)
        autoSummary = `## 日计划完成情况 (${date})\n\n`
        autoSummary += `### 已完成 (${completed.length}/${total})\n`
        autoSummary += completed.length > 0 ? completed.map((i: any) => `- [x] ${i.title}`).join('\n') + '\n' : '- 无\n'
        autoSummary += `\n### 未完成 (${incomplete.length}/${total})\n`
        autoSummary += incomplete.length > 0 ? incomplete.map((i: any) => `- [ ] ${i.title}`).join('\n') + '\n' : '- 无\n'
        autoSummary += `\n完成率: ${rate}%`
      }
    } else {
      autoSummary = `## 日报 (${date})\n\n今日无计划。`
    }

    return { user_id: userId, date, plan_id: planId, auto_summary: autoSummary }
  })

  // 5. Batch insert
  const { error: insertErr } = await client
    .from('daily_reports')
    .insert(newReports)

  if (insertErr) return fail('批量生成失败: ' + insertErr.message, 500, event)

  // 6. Return all reports in range
  const { data: allReports } = await client
    .from('daily_reports')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  return success({ generated: missingDates.length, reports: allReports }, event)
})
