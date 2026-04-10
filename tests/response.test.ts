import { describe, it, expect, vi, beforeEach } from 'vitest'
import { success, fail } from '../server/utils/response'

vi.mock('../server/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}))

describe('Response Utils', () => {
  describe('success', () => {
    it('should return success response with data', () => {
      const data = { id: 1, title: 'Test' }
      const result = success(data)

      expect(result.code).toBe(200)
      expect(result.data).toEqual(data)
      expect(result.message).toBe('ok')
      expect(result.traceId).toMatch(/^t-\d+-[a-z0-9]+$/)
    })

    it('should return success response with null data', () => {
      const result = success(null)

      expect(result.code).toBe(200)
      expect(result.data).toBeNull()
      expect(result.message).toBe('ok')
    })

    it('should return success response with array', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const result = success(data)

      expect(result.code).toBe(200)
      expect(result.data).toEqual(data)
    })
  })

  describe('fail', () => {
    it('should return fail response with default code 500', () => {
      const result = fail('Something went wrong')

      expect(result.code).toBe(500)
      expect(result.data).toBeNull()
      expect(result.message).toBe('Something went wrong')
      expect(result.traceId).toMatch(/^t-\d+-[a-z0-9]+$/)
    })

    it('should return fail response with custom code', () => {
      const result = fail('Not found', 404)

      expect(result.code).toBe(404)
      expect(result.message).toBe('Not found')
    })

    it('should return fail response with code 400', () => {
      const result = fail('Invalid input', 400)

      expect(result.code).toBe(400)
      expect(result.message).toBe('Invalid input')
    })
  })
})
