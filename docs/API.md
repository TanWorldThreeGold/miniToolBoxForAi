# API 接口文档

## 通用

### 响应格式
```ts
{ code: 200|400|401|500, data: T|null, message: string, traceId: string }
```

### 认证
- 所有 `/api/` 路由由 `server/middleware/auth.ts` 统一认证
- 未登录返回 `{ code: 401, message: "未登录" }`
- handler 中通过 `event.context.user` 获取用户

### 验证
- POST/PUT 接口使用 zod schema 验证（`server/utils/validators.ts`）
- 验证失败返回 `{ code: 400, message: "具体错误信息" }`

---

## TODO 模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/todos` | 获取列表 | - | `Todo[]` |
| POST | `/api/todos` | 创建 | `{ title: string }` | `Todo` |
| PUT | `/api/todos/:id` | 更新 | `{ title?: string, completed?: boolean }` | `Todo` |
| DELETE | `/api/todos/:id` | 删除 | - | `null` |

### 类型
```ts
interface Todo { id: number; title: string; completed: boolean; sort_order: number }
```

### 验证 Schema
- 创建: `todoCreateSchema` — title 必填, 1-200字
- 更新: `todoUpdateSchema` — title 或 completed 至少提供一个

---

## 记账模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/expenses` | 获取列表 | - | `Expense[]` |
| POST | `/api/expenses` | 创建 | `{ type, amount, category, note, date }` | `Expense` |
| PUT | `/api/expenses/:id` | 更新 | `{ type, amount, category, note, date }` | `Expense` |
| DELETE | `/api/expenses/:id` | 删除 | - | `null` |

### 类型
```ts
interface Expense { id: number; type: 'income'|'expense'; amount: number; category: string; note: string; date: string }
```

### 验证 Schema
- 创建/更新: `expenseCreateSchema` — type 枚举, amount>0, category 必填, date YYYY-MM-DD

### 分类
- 支出: 餐饮/交通/购物/娱乐/住房/医疗/教育/其他
- 收入: 工资/兼职/投资/红包/其他

---

## 日记模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/diaries` | 获取列表 | - | `Diary[]` |
| POST | `/api/diaries` | 创建 | `{ title, content, mood, date }` | `Diary` |
| PUT | `/api/diaries/:id` | 更新 | `{ title, content, mood, date }` | `Diary` |
| DELETE | `/api/diaries/:id` | 删除 | - | `null` |

### 类型
```ts
interface Diary { id: number; title: string; content: string; mood: string; date: string }
```

### 验证 Schema
- `diarySchema` — title 必填 1-200字, content ≤10000, mood ≤50, date YYYY-MM-DD

---

## 备忘录模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/memos` | 获取列表 | - | `Memo[]` |
| POST | `/api/memos` | 创建 | `{ title, content, encrypted }` | `Memo` |
| PUT | `/api/memos/:id` | 更新 | `{ title, content, encrypted }` | `Memo` |
| DELETE | `/api/memos/:id` | 删除 | - | `null` |

### 类型
```ts
interface Memo { id?: number; title: string; content: string; encrypted?: boolean }
```

### 验证 Schema
- `memoSchema` — title 必填 1-200字, content ≤50000, encrypted 默认 false

### 加密
- 客户端使用 `useMemoEncrypt()` 进行 AES-GCM 加密/解密
- 加密后 content 存储为 JSON `{ s, i, c }` (salt/iv/ciphertext 的 base64)

---

## 习惯打卡模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/habits` | 获取习惯+打卡 | - | `{ habits: HabitRow[], checks: CheckRow[] }` |
| POST | `/api/habits` | 创建习惯 | `{ name: string }` | `HabitRow` |
| POST | `/api/habits/check` | 打卡/取消 | `{ habitId: uuid, date: string, checked: boolean }` | `null` |
| DELETE | `/api/habits/:id` | 删除 | - | `null` |

### 类型
```ts
interface Habit { id: number; name: string; checkedToday: boolean; streak: number; last7: { date: string; label: string; checked: boolean }[] }
```

### 验证 Schema
- 创建: `habitCreateSchema` — name 必填 1-100字
- 打卡: `habitCheckSchema` — habitId uuid, date YYYY-MM-DD, checked boolean

### 注意
- habits.id 是 uuid 类型（非 bigint）
- streak 和 last7 由前端根据 checks 数据计算

---

## 番茄钟模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/pomodoros` | 今日统计+历史 | - | `{ count: number, history: Pomodoro[] }` |
| POST | `/api/pomodoros` | 记录完成 | `{ duration: number }` | `Pomodoro` |

### 类型
```ts
interface Pomodoro { id: number; duration: number; created_at: string }
```

### 验证 Schema
- `pomodoroCreateSchema` — duration 整数 1-7200

### 注意
- GET 返回 count（今日完成数）+ history（最近50条记录）

---

## 日计划模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/daily-plans?date=YYYY-MM-DD` | 获取单日计划(含条目) | - | `DailyPlan` 或列表 |
| POST | `/api/daily-plans` | 创建计划 | `{ date, note?, items: [{title, sort_order}] }` | `DailyPlan` |
| PUT | `/api/daily-plans/:id` | 更新备注 | `{ note }` | `DailyPlan` |
| DELETE | `/api/daily-plans/:id` | 删除计划 | - | `null` |

### 计划条目

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| POST | `/api/plan-items` | 添加条目 | `{ plan_id, title, sort_order? }` | `PlanItem` |
| PUT | `/api/plan-items/:id` | 更新条目 | `{ title?, completed?, sort_order? }` | `PlanItem` |
| DELETE | `/api/plan-items/:id` | 删除条目 | - | `null` |
| POST | `/api/plan-items/batch` | 批量创建 | `{ plan_id, items: [{title, sort_order}] }` | `PlanItem[]` |

### 类型
```ts
interface DailyPlan { id: number; date: string; note: string; items?: PlanItem[]; created_at: string; updated_at: string }
interface PlanItem { id: number; plan_id: number; title: string; completed: boolean; sort_order: number; carried_from_report_id: number | null }
```

### 验证 Schema
- 创建计划: `dailyPlanCreateSchema` — date YYYY-MM-DD, items 至少1项(title 1-200字)
- 更新计划: `dailyPlanUpdateSchema` — note ≤1000
- 创建条目: `planItemCreateSchema` — plan_id, title 1-200字
- 更新条目: `planItemUpdateSchema` — title/completed/sort_order 至少一个
- 批量创建: `planItemBatchSchema` — plan_id, items 至少1项

### 注意
- 每个用户每天只能有一个计划 (UNIQUE user_id+date)
- GET 无 date 参数时返回最近30天列表

---

## 日报模块

| 方法 | 路径 | 说明 | 请求体 | 响应 data |
|------|------|------|--------|-----------|
| GET | `/api/daily-reports?date=YYYY-MM-DD` | 获取单日日报 | - | `DailyReport` 或列表 |
| POST | `/api/daily-reports/generate` | 生成日报+顺延 | `{ date, carry_forward_item_ids: number[] }` | `DailyReport` |
| PUT | `/api/daily-reports/:id` | 编辑内容 | `{ content }` | `DailyReport` |
| DELETE | `/api/daily-reports/:id` | 删除日报 | - | `null` |

### 类型
```ts
interface DailyReport { id: number; plan_id: number | null; date: string; auto_summary: string; content: string; created_at: string; updated_at: string }
```

### 验证 Schema
- 生成: `reportGenerateSchema` — date YYYY-MM-DD, carry_forward_item_ids 数字数组
- 更新: `reportUpdateSchema` — content ≤10000

### 生成逻辑
1. 根据日期查当天计划和条目
2. 自动生成完成情况摘要(auto_summary)
3. 将选中的未完成条目顺延到明天计划
4. 幂等：重复生成刷新摘要，保留已有 content
