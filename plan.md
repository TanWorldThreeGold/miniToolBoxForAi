# ToolBox 项目完善计划

## 📊 项目概览

**ToolBox** 是一个基于 Nuxt 3 的个人效率工具箱，包含 8 个工具模块，使用 Supabase 做认证和数据库，Tailwind CSS 做样式，部署在 GitHub Pages。

---

## 🔴 严重问题（需优先修复）

### 1. 密码哈希逻辑错误 — 安全隐患
[useCrypto.ts](file:///f:/aaaa/toolbox/composables/useCrypto.ts) 中在客户端用 SHA-256 哈希密码后传给 Supabase，这是一个**安全反模式**：
- Supabase 服务端已经用 bcrypt 做了密码哈希，客户端再哈希毫无意义
- SHA-256 哈希值本身变成了"有效密码"，反而削弱了安全性
- 应该直接传原始密码给 Supabase

### 2. 服务端 API 无输入验证
所有 API 端点（如 [todos/index.post.ts](file:///f:/aaaa/toolbox/server/api/todos/index.post.ts)）直接使用 `body` 中的字段，没有任何验证：
- 缺失字段会导致数据库错误
- 类型错误（如 amount 传字符串）不会被拦截
- 需要引入请求体验证（如 zod）

### 3. 乐观更新无回滚机制
[todo.vue](file:///f:/aaaa/toolbox/pages/todo.vue)、[expense.vue](file:///f:/aaaa/toolbox/pages/expense.vue) 等页面中，UI 先更新再发 API 请求，但 API 失败时 UI 不会回滚，导致数据不一致。

### 4. SPA 部署到 GitHub Pages 路由问题
项目 `ssr: false` 部署到 GitHub Pages，但缺少 `404.html` 处理。用户直接访问 `/todo` 等路由会 404，需要在 `public/` 下添加 `404.html` 重定向。

---

## 🟡 架构改进

### 5. 服务端认证中间件重复
每个 API handler 都重复写 `serverSupabaseUser` + 未登录判断。应抽取为 Nuxt server middleware，统一处理认证。

### 6. 缺少共享类型定义
`Todo`、`Expense`、`Diary`、`Memo`、`Habit` 等接口在每个页面组件中重复定义。应抽取到 `types/` 目录统一管理，前后端共享。

### 7. 缺少数据库 Schema 文档
项目没有 Supabase migration 文件或 schema 说明。新开发者无法知道需要创建哪些表。应添加 `supabase/` 目录包含 migration SQL。

---

## 🟠 功能完善

### 8. 记账模块
- ❌ 无法编辑已有记录（只有添加和删除）
- ❌ 缺少 `expenses/[id].put.ts` 接口
- ❌ 无月份筛选，所有记录一次性加载
- ❌ 无分类统计图表

### 9. TODO 模块
- ❌ 无法编辑待办标题
- ❌ `sort_order` 字段定义了但未使用（不支持拖拽排序）
- ❌ 无筛选（全部/未完成/已完成）

### 10. 番茄钟模块
- ❌ 只有今日统计，无历史记录查看
- ❌ 计时结束无声音/通知提醒
- ❌ 页面离开后计时器丢失（无 Web Worker 支持）

### 11. 日记模块
- ❌ 无搜索功能
- ❌ 无日历视图
- ❌ 无分页/懒加载

### 12. 备忘录模块
- ❌ 密码/敏感信息明文存储在数据库，无加密
- ❌ 无搜索功能

### 13. 汇率换算模块
- ❌ API 请求失败时无错误提示
- ❌ 无汇率缓存，每次切换都重新请求

### 14. 计算器模块
- ❌ 除以零返回 0 无提示
- ❌ 浮点精度问题（如 `0.1 + 0.2`）
- ❌ 无键盘快捷键支持

---

## 🔵 代码质量

### 15. 无 ESLint / Prettier 配置
缺少代码规范工具，团队协作时风格不统一。

### 16. 零测试覆盖
没有任何单元测试或 E2E 测试。

### 17. 无 Loading 状态
所有页面 `onMounted` 获取数据时没有 loading 指示器，用户看到空白后突然出现数据。

### 18. 删除操作无确认
所有删除操作（todo、expense、diary 等）点击即删除，无二次确认弹窗。

---

## 🟣 UI/UX 改进

### 19. 无移动端导航
从工具页无法方便地返回首页或切换到其他工具，缺少底部导航栏或侧边栏。

### 20. 无暗色模式
Tailwind 已支持 dark mode，但项目未实现。

### 21. 无 PWA 支持
离线不可用，无法添加到主屏幕。

### 22. Toast 组件功能单一
[Toast.vue](file:///f:/aaaa/toolbox/components/Toast.vue) 只支持 success/error，缺少 info/warning 类型。

---

## 📋 完善计划优先级排序

| 优先级 | 任务 | 类别 |
|--------|------|------|
| **P0** | 修复密码哈希逻辑，移除客户端 SHA-256 | 安全 |
| **P0** | 添加 API 请求体验证（zod） | 安全 |
| **P0** | 修复乐观更新无回滚问题 | 稳定性 |
| **P0** | 修复 GitHub Pages SPA 路由 404 | 部署 |
| **P1** | 抽取服务端认证中间件 | 架构 |
| **P1** | 抽取共享类型定义到 `types/` | 架构 |
| **P1** | 添加 Supabase schema/migration 文件 | 开发体验 |
| **P1** | 添加删除确认弹窗 | UX |
| **P1** | 添加数据加载 loading 状态 | UX |
| **P2** | 记账：添加编辑功能 + 月份筛选 | 功能 |
| **P2** | TODO：添加编辑标题 + 筛选 | 功能 |
| **P2** | 番茄钟：计时结束通知 + 历史记录 | 功能 |
| **P2** | 日记：搜索功能 | 功能 |
| **P2** | 备忘录：敏感信息加密存储 | 安全 |
| **P2** | 移动端导航优化 | UX |
| **P3** | 添加 ESLint + Prettier | 代码质量 |
| **P3** | 添加暗色模式 | UX |
| **P3** | PWA 支持 | 功能 |
| **P3** | 添加测试 | 代码质量 |
| **P3** | 计算器键盘支持 + 精度修复 | 功能 |
| **P3** | 汇率缓存 + 错误提示 | 功能 |
