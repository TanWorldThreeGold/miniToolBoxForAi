import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) return fail('未上传文件', 400, event)

  const file = formData.find(f => f.name === 'file')
  if (!file) return fail('未找到上传文件', 400, event)

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) return fail('仅支持 JPG/PNG/GIF/WEBP 格式', 400, event)

  // 限制文件大小 10MB
  if (file.data.length > 10 * 1024 * 1024) return fail('图片大小不能超过10MB', 400, event)

  const client = await serverSupabaseClient(event)
  const userId = event.context.user.id
  const ext = file.filename?.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data: uploadData, error: uploadError } = await client.storage
    .from('photos')
    .upload(path, file.data, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) return fail(uploadError.message, 500, event)

  const { data: urlData } = client.storage.from('photos').getPublicUrl(uploadData.path)
  return success({ url: urlData.publicUrl }, event)
})
