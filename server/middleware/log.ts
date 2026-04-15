import { generateTraceId } from '~/server/utils/response'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return

  const traceId = generateTraceId()
  event.context.traceId = traceId

  const start = Date.now()

  // Log after response is sent
  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const statusCode = event.node.res.statusCode
    const level = statusCode >= 400 ? 'error' : 'info'
    const msg = `${event.method} ${event.path} → ${statusCode} (${duration}ms)`

    if (level === 'error') {
      console.error(`[${new Date().toISOString()}] [ERROR] [${traceId}] ${msg}`)
    } else {
      console.info(`[${new Date().toISOString()}] [INFO] [${traceId}] ${msg}`)
    }
  })
})
