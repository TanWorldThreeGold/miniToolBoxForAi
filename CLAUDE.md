# ToolBox 项目指南

## 技术栈
- Nuxt 3 (SPA 模式, ssr: false)
- @nuxtjs/supabase (认证 + 数据库)
- Tailwind CSS
- zod (API 输入验证)
- 部署目标: Vercel（含 server/api 后端接口）

## 项目结构
```
pages/              → 前端页面 (todo/diary/memo/expense/habits/pomodoro/login/calculator/currency)
server/api/         → 后端 RESTful 接口 (按模块分目录: todos/diaries/memos/expenses/habits/pomodoros)
server/middleware/  → auth.ts (统一认证中间件，自动设置 event.context.user)
server/utils/       → response.ts (统一响应格式) / validators.ts (zod 验证 schemas)
composables/        → useApi.ts / useToast.ts / useConfirm.ts / useMemoEncrypt.ts
components/         → Toast.vue / ToolCard.vue / ConfirmDialog.vue
layouts/            → default.vue (挂载 Toast + ConfirmDialog + 移动端底部导航)
types/              → index.ts (共享类型: Todo/Diary/Memo/Expense/Habit/Pomodoro)
supabase/           → schema.sql (数据库建表 SQL + RLS 策略)
```

## 接口约定
- 统一响应格式: `{ code: 200|500, data: T|null, message: string, traceId: string }`
- 后端用 `server/utils/response.ts` 的 `success(data)` / `fail(message)` 返回
- 前端用 `useApi()` 的 `api<T>(url, options)` 调用，自动处理错误弹 Toast
- 认证通过 `server/middleware/auth.ts` 统一处理，handler 中用 `event.context.user` 获取用户
- 所有 POST/PUT 接口使用 zod schema 验证输入 (server/utils/validators.ts)

## 新增接口模板
```ts
// server/api/xxx/index.get.ts
import { serverSupabaseClient } from '#supabase/server'
import { success, fail } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  // event.context.user 由 auth 中间件自动注入
  const client = await serverSupabaseClient(event)
  // ... 业务逻辑
})
```

## 新增页面调用模板
```ts
import type { MyType } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const res = await api<T>('/api/xxx', { method: 'POST', body: { ... } })
if (res.code === 200 && res.data) { /* 成功 */ }

// 删除操作需确认 + 乐观更新回滚
async function deleteItem(id: number) {
  if (!await confirm('确定删除？')) return
  const prev = items.value
  items.value = items.value.filter(i => i.id !== id)
  const res = await api('/api/xxx/' + id, { method: 'DELETE' })
  if (res.code !== 200) items.value = prev
}
```

## 注意事项
- 密码直接传给 Supabase（Supabase 自带 bcrypt 哈希）
- calculator 和 currency 页面无需登录 (supabase.redirectOptions.exclude)
- 登录认证仍在前端通过 @nuxtjs/supabase 处理 (cookie 管理)
- 备忘录支持客户端 AES-GCM 加密 (composables/useMemoEncrypt.ts)
- 所有删除操作需二次确认 (useConfirm + ConfirmDialog)
- 乐观更新需带回滚机制（保存 prev 状态，失败时恢复）
- 部署到 Vercel，支持 Serverless API
