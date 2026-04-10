import { describe, it, expect } from 'vitest'
import {
  todoCreateSchema,
  todoUpdateSchema,
  diarySchema,
  memoSchema,
  expenseCreateSchema,
  habitCreateSchema,
  habitCheckSchema,
  pomodoroCreateSchema,
} from '../server/utils/validators'

describe('Validators', () => {
  describe('todoCreateSchema', () => {
    it('should validate valid todo title', () => {
      const result = todoCreateSchema.safeParse({ title: 'Test todo' })
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const result = todoCreateSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
    })

    it('should reject title longer than 200 chars', () => {
      const result = todoCreateSchema.safeParse({ title: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })
  })

  describe('todoUpdateSchema', () => {
    it('should validate partial update with title', () => {
      const result = todoUpdateSchema.safeParse({ title: 'Updated' })
      expect(result.success).toBe(true)
    })

    it('should validate partial update with completed', () => {
      const result = todoUpdateSchema.safeParse({ completed: true })
      expect(result.success).toBe(true)
    })

    it('should reject empty update', () => {
      const result = todoUpdateSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('diarySchema', () => {
    it('should validate valid diary', () => {
      const result = diarySchema.safeParse({
        title: 'My Diary',
        content: 'Hello world',
        mood: 'happy',
        date: '2024-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = diarySchema.safeParse({
        title: 'My Diary',
        date: '2024/01/15',
      })
      expect(result.success).toBe(false)
    })

    it('should use default values for optional fields', () => {
      const result = diarySchema.safeParse({
        title: 'My Diary',
        date: '2024-01-15',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('')
        expect(result.data.mood).toBe('')
      }
    })
  })

  describe('memoSchema', () => {
    it('should validate valid memo', () => {
      const result = memoSchema.safeParse({
        title: 'My Memo',
        content: 'Secret content',
        encrypted: true,
      })
      expect(result.success).toBe(true)
    })

    it('should use default encrypted value', () => {
      const result = memoSchema.safeParse({
        title: 'My Memo',
        content: 'Content',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.encrypted).toBe(false)
      }
    })
  })

  describe('expenseCreateSchema', () => {
    it('should validate valid expense', () => {
      const result = expenseCreateSchema.safeParse({
        type: 'expense',
        amount: 100.5,
        category: 'food',
        note: 'Lunch',
        date: '2024-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should validate valid income', () => {
      const result = expenseCreateSchema.safeParse({
        type: 'income',
        amount: 5000,
        category: 'salary',
        date: '2024-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid type', () => {
      const result = expenseCreateSchema.safeParse({
        type: 'other',
        amount: 100,
        category: 'test',
        date: '2024-01-15',
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero or negative amount', () => {
      const result1 = expenseCreateSchema.safeParse({
        type: 'expense',
        amount: 0,
        category: 'test',
        date: '2024-01-15',
      })
      expect(result1.success).toBe(false)

      const result2 = expenseCreateSchema.safeParse({
        type: 'expense',
        amount: -10,
        category: 'test',
        date: '2024-01-15',
      })
      expect(result2.success).toBe(false)
    })
  })

  describe('habitCreateSchema', () => {
    it('should validate valid habit name', () => {
      const result = habitCreateSchema.safeParse({ name: 'Exercise' })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = habitCreateSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('habitCheckSchema', () => {
    it('should validate valid habit check', () => {
      const result = habitCheckSchema.safeParse({
        habitId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        checked: true,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid uuid', () => {
      const result = habitCheckSchema.safeParse({
        habitId: 'not-a-uuid',
        date: '2024-01-15',
        checked: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('pomodoroCreateSchema', () => {
    it('should validate valid duration', () => {
      const result = pomodoroCreateSchema.safeParse({ duration: 25 })
      expect(result.success).toBe(true)
    })

    it('should reject duration out of range', () => {
      const result1 = pomodoroCreateSchema.safeParse({ duration: 0 })
      expect(result1.success).toBe(false)

      const result2 = pomodoroCreateSchema.safeParse({ duration: 8000 })
      expect(result2.success).toBe(false)
    })

    it('should reject non-integer duration', () => {
      const result = pomodoroCreateSchema.safeParse({ duration: 25.5 })
      expect(result.success).toBe(false)
    })
  })
})
