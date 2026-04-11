type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, message: string, traceId?: string): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  const trace = traceId ? ` [${traceId}]` : ''
  return `${prefix}${trace} ${message}`
}

export const logger = {
  debug(message: string, traceId?: string) {
    if (!shouldLog('debug')) return
    console.debug(formatMessage('debug', message, traceId))
  },

  info(message: string, traceId?: string) {
    if (!shouldLog('info')) return
    console.info(formatMessage('info', message, traceId))
  },

  warn(message: string, traceId?: string) {
    if (!shouldLog('warn')) return
    console.warn(formatMessage('warn', message, traceId))
  },

  error(message: string, traceId?: string) {
    if (!shouldLog('error')) return
    console.error(formatMessage('error', message, traceId))
  },
}

export default logger
