# ToolBox 项目规则

## 项目概述

- **框架**: Nuxt 3 (Vue 3 + TypeScript)
- **样式**: Tailwind CSS
- **数据库/认证**: Supabase
- **部署**: Vercel (支持 Serverless API)
- **包管理**: npm
- **API验证**: zod

## 代码规范

### TypeScript
- 所有文件使用 `.ts` 扩展名
- 显式定义接口类型，避免 `any`
- 使用 `ref<T>()` 和 `reactive<T>()` 时指定泛型类型
- 共享类型定义在 `types/index.ts`

### Vue 组件
- 使用 `<script setup lang="ts">` 语法
- 组件名使用 PascalCase
- Props 使用类型定义：`defineProps<{ prop: Type }>()`

### 样式
- 优先使用 Tailwind CSS 工具类
- 自定义颜色通过 `tailwind.config.ts` 配置
- 避免内联样式，特殊情况除外

### API 开发
- 服务端 API 统一使用 `server/middleware/auth.ts` 认证
- handler 中通过 `event.context.user` 获取当前用户
- 使用 `server/utils/validators.ts` 中的 zod schema 验证输入
- 统一响应格式：`{ code, data, message, traceId }`

## 安全规范

### 认证
- **禁止**客户端密码哈希，直接传原始密码给 Supabase
- API 端点通过中间件统一认证
- 数据库操作必须包含 `.eq('user_id', user.id)` 或使用 RLS 策略

### 数据
- 敏感信息（密码、密钥）必须存储在 `.env`，不提交到 Git
- 备忘录敏感内容支持客户端 AES-GCM 加密 (useMemoEncrypt)

## 项目结构

```
components/          # Vue 组件 (Toast, ToolCard, ConfirmDialog)
composables/         # 组合式函数 (useApi, useToast, useConfirm, useMemoEncrypt)
layouts/             # 布局 (default.vue 含底部导航)
pages/               # 页面（自动生成路由）
server/
  api/               # API 路由 (todos, expenses, diaries, memos, habits, pomodoros)
  middleware/        # 认证中间件 (auth.ts)
  utils/             # 服务端工具 (response.ts, validators.ts)
public/              # 静态资源
types/               # 共享类型定义
supabase/            # 数据库 schema.sql
```

## 开发命令

```bash
npm run dev      # 开发服务器
npm run build    # 构建 (Vercel 部署用)
npm run generate # 静态生成
npm run preview  # 预览构建结果
```

## 提交规范

- 提交前确保代码可运行
- 不提交 `.env` 文件
- 不提交 `node_modules` 和 `.output`

## 开发注意事项

1. **乐观更新**: UI 更新后 API 失败时需要有回滚机制
2. **Loading 状态**: 数据获取时显示加载指示器
3. **错误处理**: 使用 `useApi()` 统一处理，显示 Toast 提示
4. **删除确认**: 重要删除操作使用 `useConfirm()` 二次确认
5. **移动端**: 布局已包含底部导航栏 (sm:hidden)
6. **加密**: 备忘录使用 `useMemoEncrypt()` 进行客户端加密

## 部署

- **平台**: Vercel
- **类型**: Serverless (支持 server/api 后端接口)
- **环境变量**: 在 Vercel Dashboard 配置 SUPABASE_URL 和 SUPABASE_KEY
