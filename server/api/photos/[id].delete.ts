import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  // 先获取照片信息以删除存储文件
  const { data: photo } = await client
    .from('photos')
    .select('url')
    .eq('id', id)
    .eq('user_id', event.context.user.id)
    .single()

  if (photo?.url) {
    // 从 URL 中提取存储路径
    try {
      const url = new URL(photo.url)
      const pathSegments = url.pathname.split('/storage/v1/object/public/photos/')[1]
      if (pathSegments) {
        await client.storage.from('photos').remove([pathSegments])
      }
    } catch {}
  }

  const { error } = await client
    .from('photos')
    .delete()
    .eq('id', id)
    .eq('user_id', event.context.user.id)

  if (error) return fail(error.message, 500, event)
  return success(null, event)
})
