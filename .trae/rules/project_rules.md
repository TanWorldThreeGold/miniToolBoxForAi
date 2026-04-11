# ToolBox 项目规则

## 项目概述

- **框架**: Nuxt 3 (Vue 3 + TypeScript)
- **样式**: Tailwind CSS
- **数据库/认证**: Supabase
- **部署**: Vercel (支持 Serverless API)
- **包管理**: npm
- **API验证**: zod

## 文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| AI 快速参考 | `.trae/QUICK_REF.md` | AI 工作时快速查找关键文件 |
| API 接口文档 | `docs/API.md` | 所有接口定义、类型、验证规则 |
| 数据库文档 | `docs/DB.md` | 表结构、字段、关系 |
| 代码模板 | `.trae/snippets/` | 新增模块的代码模板 |

## 代码规范

### TypeScript
- 所有文件使用 `.ts` 扩展名
- 显式定义接口类型，避免 `any`
- 使用 `ref<T>()` 和 `reactive<T>()` 时指定泛型类型
- 共享类型定义在 `types/index.ts`，页面中禁止重复定义

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
docs/                # API.md + DB.md
.trae/
  rules/             # project_rules.md
  QUICK_REF.md       # AI 快速参考
  snippets/          # 代码模板 (api-index-get/post, api-id-put/delete, page, validator)
```

## 开发命令

```bash
npm run dev      # 开发服务器
npm run build    # 构建 (Vercel 部署用)
npm run generate # 静态生成
npm run preview  # 预览构建结果
```

### AI 执行命令说明

由于 Windows PowerShell 执行策略限制，AI 执行 npm 命令时需使用 Git Bash：

```bash
bash -c "npm run build"    # 使用 Git Bash 执行构建
bash -c "npm run dev"      # 使用 Git Bash 启动开发服务器
bash -c "npm run lint"     # 使用 Git Bash 执行 lint
```

## 提交规范

- 提交前确保代码可运行
- 不提交 `.env` 文件
- 不提交 `node_modules` 和 `.output`
- **禁止自动提交推送**：只有用户发出 `提交代码` 指令时，才能执行 git commit 和 git push
- **禁止自动构建测试**：用户发出 `提交代码` 指令后，再执行 `npm run build` 验证，避免每次任务都浪费时间构建

## 开发注意事项

1. **乐观更新**: UI 更新后 API 失败时需要有回滚机制
2. **Loading 状态**: 数据获取时显示加载指示器
3. **错误处理**: 使用 `useApi()` 统一处理，显示 Toast 提示
4. **删除确认**: 重要删除操作使用 `useConfirm()` 二次确认
5. **移动端**: 布局已包含底部导航栏 (sm:hidden)
6. **加密**: 备忘录使用 `useMemoEncrypt()` 进行客户端加密
7. **类型**: 所有页面使用 `types/index.ts` 中的共享类型，禁止重复定义

## 部署

- **平台**: Vercel
- **类型**: Serverless (支持 server/api 后端接口)
- **环境变量**: 在 Vercel Dashboard 配置 SUPABASE_URL 和 SUPABASE_KEY

## 开发流程规范（重要）

### 提交前必须执行

```bash
npm run build    # 构建验证（必须通过）
npm run test     # 测试验证（如果有测试用例）
```

### 禁止事项

| 禁止 | 原因 |
|------|------|
| Vue 模板文本包含 `<` `>` `/` | 会被解析为 HTML 标签，导致构建失败 |
| 直接推送未验证的代码 | 会导致 Vercel 部署失败 |
| 一次性提交大量代码 | 错误难以定位 |

### 开发流程

```
1. 开发功能 → 2. 本地构建 → 3. 本地测试 → 4. 提交 → 5. 推送 → 6. Vercel 部署
```

### 常见构建错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Vue template syntax error | 模板中包含特殊字符 | 检查 `<` `>` `/` 字符 |
| Module not found | 导入路径错误 | 检查相对路径 |
| Type error | TypeScript 类型错误 | 检查类型定义 |

## 已完成功能

- ✅ TODO 管理（优先级、截止日期）
- ✅ 记账（分类统计图表、导出CSV）
- ✅ 习惯打卡（30天热力图、连续天数、归档）
- ✅ 密码生成器、单位换算、二维码生成器、倒计时
- ✅ 数据导入/导出、主题切换、日志、测试用例

## 待实现功能

详见 `plan.md` 文件

## 错误复盘机制

### 严重错误定义（仅记录以下类型）
- 导致 Vercel 部署失败
- 导致数据丢失或安全问题
- 导致用户功能不可用

### 不需要复盘的错误
- 简单的语法错误、路径错误、类型错误
- 本地构建能发现的问题
- 不影响生产环境的问题

### 复盘流程

```
1. 发现错误 → 2. 分析原因 → 3. 记录到 .trae/LESSONS_LEARNED.md → 4. 等待用户指令提交
```

### 复盘模板

```markdown
## 错误 #N：[错误标题]

**日期**：YYYY-MM-DD

**错误代码**：
[错误代码片段]

**错误原因**：
[分析原因]

**解决方案**：
[修复方法]

**教训**：
[总结经验]
```

### 新会话必读

每次新会话开始时，请先阅读：
1. `.trae/rules/project_rules.md` - 项目规范
2. `.trae/LESSONS_LEARNED.md` - 错误复盘记录
3. `plan.md` - 功能进度
