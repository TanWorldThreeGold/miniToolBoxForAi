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
