type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  traceId?: string
  data?: any
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function formatTimestamp(): string {
  return new Date().toISOString()
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatMessage(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  const traceId = entry.traceId ? ` [${entry.traceId}]` : ''
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
  return `${prefix}${traceId} ${entry.message}${data}`
}

export const logger = {
  debug(message: string, traceId?: string, data?: any) {
    if (!shouldLog('debug')) return
    const entry: LogEntry = { level: 'debug', message, timestamp: formatTimestamp(), traceId, data }
    console.debug(formatMessage(entry))
  },

  info(message: string, traceId?: string, data?: any) {
    if (!shouldLog('info')) return
    const entry: LogEntry = { level: 'info', message, timestamp: formatTimestamp(), traceId, data }
    console.info(formatMessage(entry))
  },

  warn(message: string, traceId?: string, data?: any) {
    if (!shouldLog('warn')) return
    const entry: LogEntry = { level: 'warn', message, timestamp: formatTimestamp(), traceId, data }
    console.warn(formatMessage(entry))
  },

  error(message: string, traceId?: string, data?: any) {
    if (!shouldLog('error')) return
    const entry: LogEntry = { level: 'error', message, timestamp: formatTimestamp(), traceId, data }
    console.error(formatMessage(entry))
  },

  request(method: string, path: string, traceId?: string) {
    this.info(`${method} ${path}`, traceId)
  },

  response(method: string, path: string, status: number, duration: number, traceId?: string) {
    this.info(`${method} ${path} -> ${status} (${duration}ms)`, traceId)
  },
}

export default logger
