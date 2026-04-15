import { logger } from './logger'
import type { H3Event } from 'h3'

export interface ApiResponse<T = any> {
  code: number
  data: T | null
  message: string
  traceId: string
}

export function generateTraceId(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 6)
  return `t-${ts}-${rand}`
}

/**
 * 从事件上下文获取 traceId，保证同一请求的日志和响应使用同一个 traceId
 */
function getTraceId(event?: H3Event): string {
  if (event?.context?.traceId) return event.context.traceId
  return generateTraceId()
}

export function success<T>(data: T, event?: H3Event): ApiResponse<T> {
  return { code: 200, data, message: 'ok', traceId: getTraceId(event) }
}

export function fail(message: string, code = 500, event?: H3Event): ApiResponse<null> {
  const traceId = getTraceId(event)
  logger.error(message, traceId)
  return { code, data: null, message, traceId }
}
