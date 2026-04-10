import { z } from 'zod'

export const MODULECreateSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(200),
})

export const MODULEUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
}).refine(d => Object.keys(d).length > 0, '至少提供一个更新字段')
