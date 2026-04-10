# AI 快速参考

## 技术栈
Nuxt 3 (SPA) + Supabase + Tailwind + zod | 部署: Vercel

## 关键文件速查

| 需求 | 文件 |
|------|------|
| 类型定义 | `types/index.ts` |
| API 接口文档 | `docs/API.md` |
| 数据库文档 | `docs/DB.md` |
| 数据库 Schema | `supabase/schema.sql` |
| API 响应格式 | `server/utils/response.ts` |
| 验证 Schema | `server/utils/validators.ts` |
| 认证中间件 | `server/middleware/auth.ts` |
| 前端请求封装 | `composables/useApi.ts` |
| 删除确认 | `composables/useConfirm.ts` |
| 备忘录加密 | `composables/useMemoEncrypt.ts` |
| Toast 提示 | `composables/useToast.ts` |

## 模块映射

| 模块 | 页面 | API 目录 | 类型 |
|------|------|----------|------|
| TODO | `pages/todo.vue` | `server/api/todos/` | `Todo` |
| 记账 | `pages/expense.vue` | `server/api/expenses/` | `Expense` |
| 日记 | `pages/diary.vue` | `server/api/diaries/` | `Diary` |
| 备忘录 | `pages/memo.vue` | `server/api/memos/` | `Memo` |
| 习惯打卡 | `pages/habits.vue` | `server/api/habits/` | `Habit` |
| 番茄钟 | `pages/pomodoro.vue` | `server/api/pomodoros/` | `Pomodoro` |
| 计算器 | `pages/calculator.vue` | 无 | - |
| 汇率换算 | `pages/currency.vue` | 无 | - |

## 开发模式

1. 查类型 → `types/index.ts`
2. 查 API → `docs/API.md`
3. 查数据库 → `docs/DB.md`
4. 查验证规则 → `server/utils/validators.ts`

## 约定

- 响应格式: `{ code, data, message, traceId }`
- 认证: 中间件自动注入 `event.context.user`
- 删除: 需 `useConfirm()` 二次确认
- 乐观更新: 保存 prev，失败回滚
- 密码: 直接传 Supabase，禁止客户端哈希
- 无需登录: `/calculator`, `/currency`
