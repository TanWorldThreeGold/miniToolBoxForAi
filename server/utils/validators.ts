import { z } from 'zod'

export const todoCreateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  parent_id: z.number().nullable().optional(),
})

export const todoUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).refine(d => Object.keys(d).length > 0, '至少提供一个更新字段')

export const diarySchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  content: z.string().max(10000).default(''),
  mood: z.string().max(50).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
})

export const memoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  content: z.string().max(50000).default(''),
  encrypted: z.boolean().default(false),
})

export const expenseCreateSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('金额必须大于0'),
  category: z.string().min(1, '分类不能为空').max(50),
  note: z.string().max(500).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
})

export const habitCreateSchema = z.object({
  name: z.string().min(1, '习惯名称不能为空').max(100),
})

export const habitUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  archived: z.boolean().optional(),
})

export const habitCheckSchema = z.object({
  habitId: z.string().uuid('习惯ID格式错误'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  checked: z.boolean(),
})

export const pomodoroCreateSchema = z.object({
  duration: z.number().int().min(1).max(7200),
})

export const countdownSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
})

// ========== 日计划 ==========
export const dailyPlanCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  note: z.string().max(1000).default(''),
  items: z.array(z.object({
    title: z.string().min(1, '计划项不能为空').max(200),
    sort_order: z.number().int().default(0),
  })).min(1, '至少添加一个计划项'),
})

export const dailyPlanUpdateSchema = z.object({
  note: z.string().max(1000).optional(),
})

// ========== 计划条目 ==========
export const planItemCreateSchema = z.object({
  plan_id: z.number().int().positive(),
  title: z.string().min(1, '计划项不能为空').max(200),
  sort_order: z.number().int().default(0),
})

export const planItemUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  sort_order: z.number().int().optional(),
}).refine(d => Object.keys(d).length > 0, '至少提供一个更新字段')

export const planItemBatchSchema = z.object({
  plan_id: z.number().int().positive(),
  items: z.array(z.object({
    title: z.string().min(1, '计划项不能为空').max(200),
    sort_order: z.number().int().default(0),
  })).min(1, '至少添加一个计划项'),
})

// ========== 日报 ==========
export const reportGenerateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  carry_forward_item_ids: z.array(z.number().int()).default([]),
  empty: z.boolean().default(false),
})

export const reportUpdateSchema = z.object({
  content: z.string().max(10000),
})

export const reportBatchGenerateSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '起始日期格式错误'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '结束日期格式错误'),
})

// ========== 照片墙 ==========
export const photoSchema = z.object({
  url: z.string().min(1, '图片地址不能为空'),
  title: z.string().max(200).default(''),
  description: z.string().max(1000).default(''),
})

export const photoUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
}).refine(d => Object.keys(d).length > 0, '至少提供一个更新字段')
