# 提高 AI 工作效率、减少 Token 消耗计划

## 目标

优化项目结构和文档，使 AI 能更快理解上下文，减少重复读取文件的 Token 消耗。

***

## 问题分析

### 当前痛点

1. **文件分散** - AI 需要读取多个文件才能理解完整功能
2. **重复类型定义** - 类型在 `types/index.ts` 和各页面重复
3. **缺少模块说明** - 每个工具模块没有独立文档
4. **API 文档缺失** - 接口定义分散在多个文件
5. **上下文过长** - 每次对话需要重复加载项目规则

### Token 消耗点

* 重复读取 `project_rules.md`

* 读取多个 API 文件理解接口规范

* 读取页面 + API + 类型定义理解功能

***

## 优化方案

### Phase 1: 文档聚合（高优先级）

#### 1.1 创建模块 README

为每个功能模块创建独立文档，聚合所有相关信息：

```
modules/
├── todo/
│   ├── README.md       # 功能说明、API 列表、类型定义
│   ├── page.vue        # 从 pages/ 迁移
│   └── api/
│       ├── index.get.ts
│       ├── index.post.ts
│       └── ...
```

**内容包含：**

* 功能描述

* 页面路由

* API 端点列表

* 请求/响应类型

* 数据库表结构

#### 1.2 创建 API 索引文档

创建 `docs/API.md`，汇总所有接口：

```markdown
## TODO 模块
- `GET /api/todos` - 获取列表
- `POST /api/todos` - 创建
- `PUT /api/todos/:id` - 更新
- `DELETE /api/todos/:id` - 删除

## 记账模块
...
```

#### 1.3 创建数据库文档

创建 `docs/DB.md`，汇总表结构：

```markdown
## todos
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | bigint | 主键 |
| title | text | 标题 |
...
```

### Phase 2: 代码优化（中优先级）

#### 2.1 统一错误处理

当前 `useApi.ts` 已统一处理，但可进一步优化：

* 添加错误码枚举

* 标准化错误消息

#### 2.2 提取共享逻辑

将页面中重复逻辑提取到 composables：

* `useCrud()` - 通用增删改查

* `useLoading()` - 加载状态管理

#### 2.3 类型定义优化

确保 `types/index.ts` 是**唯一**类型来源，页面中不再重复定义。

### Phase 3: AI 上下文优化（高优先级）

#### 3.1 创建 `.trae/.cursorrules` 简化版

创建 AI 快速参考文档，比 `project_rules.md` 更精简：

```
# AI 快速参考

## 技术栈
Nuxt 3 + Supabase + Tailwind + zod

## 关键文件
- types/index.ts - 类型定义
- server/utils/response.ts - API 响应
- server/utils/validators.ts - 验证 schema
- composables/useApi.ts - 请求封装

## 开发模式
1. 查类型 → types/index.ts
2. 查 API → docs/API.md
3. 查数据库 → docs/DB.md
```

#### 3.2 创建模块索引

创建 `.trae/modules.json`，AI 可快速定位：

```json
{
  "modules": [
    { "name": "todo", "path": "pages/todo.vue", "api": "server/api/todos/" },
    { "name": "expense", "path": "pages/expense.vue", "api": "server/api/expenses/" }
  ]
}
```

### Phase 4: 自动化工具（低优先级）

#### 4.1 创建文档生成脚本

编写脚本自动生成：

* API 文档（从 `server/api/` 扫描）

* 类型文档（从 `types/index.ts` 提取）

#### 4.2 创建代码片段

在 `.trae/snippets/` 创建常用代码模板：

* `api-route.ts` - API 路由模板

* `page.vue` - 页面模板

* `validator.ts` - zod schema 模板

***

## 实施步骤

### Step 1: 创建文档目录结构

```
docs/
├── API.md          # 接口汇总
├── DB.md           # 数据库文档
└── ARCHITECTURE.md # 架构说明

.trae/
├── rules/
│   └── project_rules.md  # 已有
├── QUICK_REF.md          # 新增：AI 快速参考
├── modules.json          # 新增：模块索引
└── snippets/             # 新增：代码模板
    ├── api-route.ts
    ├── page.vue
    └── validator.ts
```

### Step 2: 填充文档内容

1. 从现有代码提取信息填充 `docs/API.md`
2. 从 `supabase/schema.sql` 生成 `docs/DB.md`
3. 创建 `QUICK_REF.md` 精简版规则

### Step 3: 优化类型定义

检查所有页面，确保使用 `types/index.ts` 中的类型，删除重复定义。

### Step 4: 验证效果

测试 AI 在新结构下的响应：

* 询问某个功能，看是否能快速定位

* 询问 API，看是否需要读取多个文件

***

## 预期效果

| 指标         | 优化前   | 优化后              |
| ---------- | ----- | ---------------- |
| 理解功能需读取文件数 | 4-5 个 | 1-2 个            |
| 重复类型定义     | 多处    | 仅 types/index.ts |
| 项目规则长度     | 长文档   | 快速参考             |
| 新功能开发准备时间  | 长     | 短                |

***

## 优先级

1. **P0** - 创建 `docs/API.md` 和 `docs/DB.md`
2. **P0** - 创建 `.trae/QUICK_REF.md`
3. **P1** - 统一类型定义
4. **P1** - 创建 `.trae/snippets/`
5. **P2** - 创建文档生成脚本

