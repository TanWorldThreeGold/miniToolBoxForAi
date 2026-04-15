import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'
import { reportGenerateSchema } from '~/server/utils/validators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = reportGenerateSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400, event)

  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id
  const { date, carry_forward_item_ids, empty } = parsed.data

  // Empty mode: create blank report
  if (empty) {
    const { data: existingReport } = await client
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (existingReport) return success(existingReport, event)

    const { data, error } = await client
      .from('daily_reports')
      .insert({ user_id: userId, date, auto_summary: '' })
      .select()
      .single()

    if (error) return fail(error.message, 500, event)
    return success(data, event)
  }

  // 1. Fetch plan and items for this date
  const { data: plan } = await client
    .from('daily_plans')
    .select('*, plan_items(*)')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  // 2. Build auto_summary
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
      if (completed.length > 0) {
        autoSummary += completed.map((i: any) => `- [x] ${i.title}`).join('\n') + '\n'
      } else {
        autoSummary += '- 无\n'
      }
      autoSummary += `\n### 未完成 (${incomplete.length}/${total})\n`
      if (incomplete.length > 0) {
        autoSummary += incomplete.map((i: any) => `- [ ] ${i.title}`).join('\n') + '\n'
      } else {
        autoSummary += '- 无\n'
      }
      autoSummary += `\n完成率: ${rate}%`
    }
  } else {
    autoSummary = `## 日报 (${date})\n\n今日无计划。`
  }

  // 3. Handle carry-forward
  if (carry_forward_item_ids.length > 0 && plan) {
    const itemsToCarry = (plan.plan_items || []).filter(
      (i: any) => !i.completed && carry_forward_item_ids.includes(i.id)
    )

    if (itemsToCarry.length > 0) {
      // Calculate next day (local date math to avoid timezone issues)
      const [ny, nm, nd] = date.split('-').map(Number)
      const nextDay = new Date(ny, nm - 1, nd + 1)
      const nextDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`

      // Find or create next day's plan
      let { data: nextPlan } = await client
        .from('daily_plans')
        .select('*, plan_items(sort_order)')
        .eq('user_id', userId)
        .eq('date', nextDateStr)
        .single()

      if (!nextPlan) {
        const { data: created, error: createErr } = await client
          .from('daily_plans')
          .insert({ user_id: userId, date: nextDateStr })
          .select()
          .single()
        if (createErr) return fail('创建顺延计划失败: ' + createErr.message, 500, event)
        nextPlan = { ...created, plan_items: [] }
      }

      // Calculate max sort_order in target plan
      const existingItems = nextPlan.plan_items || []
      const maxOrder = existingItems.length > 0
        ? Math.max(...existingItems.map((i: any) => i.sort_order)) + 1
        : 0

      // Insert carried items
      const carriedItems = itemsToCarry.map((item: any, i: number) => ({
        plan_id: nextPlan!.id,
        user_id: userId,
        title: item.title,
        sort_order: maxOrder + i,
      }))

      const { error: batchErr } = await client
        .from('plan_items')
        .insert(carriedItems)

      if (batchErr) return fail('顺延条目失败: ' + batchErr.message, 500, event)
    }
  }

  // 4. Upsert report (idempotent)
  const { data: existingReport } = await client
    .from('daily_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  let report
  if (existingReport) {
    const { data, error } = await client
      .from('daily_reports')
      .update({ auto_summary: autoSummary, plan_id: planId, updated_at: new Date().toISOString() })
      .eq('id', existingReport.id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) return fail(error.message, 500, event)
    report = data
  } else {
    const { data, error } = await client
      .from('daily_reports')
      .insert({ user_id: userId, date, plan_id: planId, auto_summary: autoSummary })
      .select()
      .single()
    if (error) return fail(error.message, 500, event)
    report = data
  }

  return success(report, event)
})
