# 数据库文档

## 概述

- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (auth.users)
- **安全**: 所有表启用 RLS (Row Level Security)
- **Schema 文件**: `supabase/schema.sql`

---

## 表结构

### todos

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| title | text | NOT NULL | 标题 |
| completed | boolean | DEFAULT false | 是否完成 |
| sort_order | int | DEFAULT 0 | 排序 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

RLS: `auth.uid() = user_id`

---

### expenses

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| type | text | NOT NULL, CHECK(income/expense) | 收入/支出 |
| amount | numeric(12,2) | NOT NULL, CHECK(>0) | 金额 |
| category | text | NOT NULL | 分类 |
| note | text | DEFAULT '' | 备注 |
| date | date | NOT NULL | 日期 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

RLS: `auth.uid() = user_id`

---

### diaries

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| title | text | NOT NULL | 标题 |
| content | text | DEFAULT '' | 内容 |
| mood | text | DEFAULT '' | 心情 |
| date | date | NOT NULL | 日期 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

RLS: `auth.uid() = user_id`

---

### memos

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| title | text | NOT NULL | 标题 |
| content | text | DEFAULT '' | 内容（可能加密） |
| encrypted | boolean | DEFAULT false | 是否加密 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |
| updated_at | timestamptz | DEFAULT now() | 更新时间 |

RLS: `auth.uid() = user_id`

---

### habits

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, gen_random_uuid() | 主键（UUID） |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| name | text | NOT NULL | 习惯名称 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

RLS: `auth.uid() = user_id`

---

### habit_checks

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| habit_id | uuid | FK→habits, NOT NULL, CASCADE | 习惯ID |
| user_id | uuid | FK→auth.users, NOT NULL, CASCADE | 用户ID |
| date | date | NOT NULL | 打卡日期 |

UNIQUE: `(habit_id, date)`

RLS: `auth.uid() = user_id`

---

### pomodoros

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | bigint | PK, auto | 主键 |
| user_id | uuid | FK→auth.users, NOT NULL | 用户ID |
| duration | int | NOT NULL, CHECK(>0) | 时长（分钟） |
| created_at | timestamptz | DEFAULT now() | 完成时间 |

RLS: `auth.uid() = user_id`

---

## 关系图

```
auth.users (Supabase Auth)
  ├── todos (user_id)
  ├── expenses (user_id)
  ├── diaries (user_id)
  ├── memos (user_id)
  ├── habits (user_id)
  │     └── habit_checks (habit_id, user_id)
  └── pomodoros (user_id)
```

## 注意事项

- 所有表都有 `ON DELETE CASCADE`，删除用户时自动清理
- habits.id 是 uuid 类型，其他表 id 是 bigint
- memos.content 可能存储加密后的 JSON 字符串
