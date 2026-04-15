import { success } from '~/server/utils/response'

export default defineEventHandler((event) => {
  return success({ status: 'ok', timestamp: new Date().toISOString() }, event)
})
