export interface ApiResponse<T = any> {
  code: number
  data: T | null
  message: string
  traceId: string
}

function generateTraceId(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 6)
  return `t-${ts}-${rand}`
}

export function success<T>(data: T): ApiResponse<T> {
  return { code: 200, data, message: 'ok', traceId: generateTraceId() }
}

export function fail(message: string, code = 500): ApiResponse<null> {
  const traceId = generateTraceId()
  console.error(`[${new Date().toISOString()}] [ERROR] [${traceId}] ${message}`)
  return { code, data: null, message, traceId }
}
