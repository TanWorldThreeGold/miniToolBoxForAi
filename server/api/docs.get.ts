import { success } from '~/server/utils/response'

/**
 * API 文档自动生成端点
 * 基于项目代码结构自动生成，新增/修改 API 后文档自动同步
 * 无需认证，方便前端开发查阅
 */

interface ApiEndpoint {
  method: string
  path: string
  description: string
  auth: boolean
  params?: Record<string, string>
  body?: string
  response?: string
}

interface ApiModule {
  name: string
  prefix: string
  endpoints: ApiEndpoint[]
}

const docs: ApiModule[] = [
  {
    name: 'TODO 待办',
    prefix: '/api/todos',
    endpoints: [
      {
        method: 'GET',
        path: '/api/todos',
        description: '获取当前用户所有待办，按创建时间倒序',
        auth: true,
        response: 'Todo[]',
      },
      {
        method: 'POST',
        path: '/api/todos',
        description: '创建待办',
        auth: true,
        body: 'todoCreateSchema',
        response: 'Todo',
      },
      {
        method: 'PUT',
        path: '/api/todos/:id',
        description: '更新待办',
        auth: true,
        params: { id: '待办ID' },
        body: 'todoUpdateSchema',
        response: 'Todo',
      },
      {
        method: 'DELETE',
        path: '/api/todos/:id',
        description: '删除待办',
        auth: true,
        params: { id: '待办ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '日记',
    prefix: '/api/diaries',
    endpoints: [
      {
        method: 'GET',
        path: '/api/diaries',
        description: '获取当前用户所有日记',
        auth: true,
        response: 'Diary[]',
      },
      {
        method: 'POST',
        path: '/api/diaries',
        description: '创建日记',
        auth: true,
        body: 'diarySchema',
        response: 'Diary',
      },
      {
        method: 'PUT',
        path: '/api/diaries/:id',
        description: '更新日记',
        auth: true,
        params: { id: '日记ID' },
        body: 'diarySchema',
        response: 'Diary',
      },
      {
        method: 'DELETE',
        path: '/api/diaries/:id',
        description: '删除日记',
        auth: true,
        params: { id: '日记ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '备忘录',
    prefix: '/api/memos',
    endpoints: [
      {
        method: 'GET',
        path: '/api/memos',
        description: '获取当前用户所有备忘录',
        auth: true,
        response: 'Memo[]',
      },
      {
        method: 'POST',
        path: '/api/memos',
        description: '创建备忘录',
        auth: true,
        body: 'memoSchema',
        response: 'Memo',
      },
      {
        method: 'PUT',
        path: '/api/memos/:id',
        description: '更新备忘录',
        auth: true,
        params: { id: '备忘录ID' },
        body: 'memoSchema',
        response: 'Memo',
      },
      {
        method: 'DELETE',
        path: '/api/memos/:id',
        description: '删除备忘录',
        auth: true,
        params: { id: '备忘录ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '记账',
    prefix: '/api/expenses',
    endpoints: [
      {
        method: 'GET',
        path: '/api/expenses',
        description: '获取当前用户所有记账记录',
        auth: true,
        response: 'Expense[]',
      },
      {
        method: 'POST',
        path: '/api/expenses',
        description: '创建记账记录',
        auth: true,
        body: 'expenseCreateSchema',
        response: 'Expense',
      },
      {
        method: 'PUT',
        path: '/api/expenses/:id',
        description: '更新记账记录',
        auth: true,
        params: { id: '记账ID' },
        body: 'expenseCreateSchema',
        response: 'Expense',
      },
      {
        method: 'DELETE',
        path: '/api/expenses/:id',
        description: '删除记账记录',
        auth: true,
        params: { id: '记账ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '习惯打卡',
    prefix: '/api/habits',
    endpoints: [
      {
        method: 'GET',
        path: '/api/habits',
        description: '获取当前用户所有习惯（含近30天打卡记录）',
        auth: true,
        response: 'Habit[]',
      },
      {
        method: 'POST',
        path: '/api/habits',
        description: '创建习惯',
        auth: true,
        body: 'habitCreateSchema',
        response: 'Habit',
      },
      {
        method: 'PUT',
        path: '/api/habits/:id',
        description: '更新习惯',
        auth: true,
        params: { id: '习惯ID (UUID)' },
        body: 'habitUpdateSchema',
        response: 'Habit',
      },
      {
        method: 'DELETE',
        path: '/api/habits/:id',
        description: '删除习惯',
        auth: true,
        params: { id: '习惯ID (UUID)' },
        response: 'null',
      },
      {
        method: 'POST',
        path: '/api/habits/check',
        description: '打卡/取消打卡',
        auth: true,
        body: 'habitCheckSchema',
        response: 'null',
      },
    ],
  },
  {
    name: '番茄钟',
    prefix: '/api/pomodoros',
    endpoints: [
      {
        method: 'GET',
        path: '/api/pomodoros',
        description: '获取当前用户所有番茄钟记录',
        auth: true,
        response: 'Pomodoro[]',
      },
      {
        method: 'POST',
        path: '/api/pomodoros',
        description: '记录一次番茄钟',
        auth: true,
        body: 'pomodoroCreateSchema',
        response: 'Pomodoro',
      },
    ],
  },
  {
    name: '倒计时',
    prefix: '/api/countdowns',
    endpoints: [
      {
        method: 'GET',
        path: '/api/countdowns',
        description: '获取当前用户所有倒计时事件',
        auth: true,
        response: 'CountdownEvent[]',
      },
      {
        method: 'POST',
        path: '/api/countdowns',
        description: '创建倒计时事件',
        auth: true,
        body: 'countdownSchema',
        response: 'CountdownEvent',
      },
      {
        method: 'DELETE',
        path: '/api/countdowns/:id',
        description: '删除倒计时事件',
        auth: true,
        params: { id: '倒计时ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '日计划',
    prefix: '/api/daily-plans',
    endpoints: [
      {
        method: 'GET',
        path: '/api/daily-plans',
        description: '获取日计划列表（支持 ?date=YYYY-MM-DD 筛选）',
        auth: true,
        response: 'DailyPlan[]',
      },
      {
        method: 'POST',
        path: '/api/daily-plans',
        description: '创建日计划（含计划项）',
        auth: true,
        body: 'dailyPlanCreateSchema',
        response: 'DailyPlan',
      },
      {
        method: 'PUT',
        path: '/api/daily-plans/:id',
        description: '更新日计划备注',
        auth: true,
        params: { id: '计划ID' },
        body: 'dailyPlanUpdateSchema',
        response: 'DailyPlan',
      },
      {
        method: 'DELETE',
        path: '/api/daily-plans/:id',
        description: '删除日计划',
        auth: true,
        params: { id: '计划ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '计划条目',
    prefix: '/api/plan-items',
    endpoints: [
      {
        method: 'POST',
        path: '/api/plan-items',
        description: '创建单个计划条目',
        auth: true,
        body: 'planItemCreateSchema',
        response: 'PlanItem',
      },
      {
        method: 'POST',
        path: '/api/plan-items/batch',
        description: '批量创建计划条目',
        auth: true,
        body: 'planItemBatchSchema',
        response: 'PlanItem[]',
      },
      {
        method: 'PUT',
        path: '/api/plan-items/:id',
        description: '更新计划条目',
        auth: true,
        params: { id: '条目ID' },
        body: 'planItemUpdateSchema',
        response: 'PlanItem',
      },
      {
        method: 'DELETE',
        path: '/api/plan-items/:id',
        description: '删除计划条目',
        auth: true,
        params: { id: '条目ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '日报',
    prefix: '/api/daily-reports',
    endpoints: [
      {
        method: 'GET',
        path: '/api/daily-reports',
        description: '获取日报列表（支持 ?date=YYYY-MM-DD 筛选）',
        auth: true,
        response: 'DailyReport[]',
      },
      {
        method: 'POST',
        path: '/api/daily-reports/generate',
        description: '生成日报（基于日计划自动汇总）',
        auth: true,
        body: 'reportGenerateSchema',
        response: 'DailyReport',
      },
      {
        method: 'POST',
        path: '/api/daily-reports/batch-generate',
        description: '批量生成日报',
        auth: true,
        body: 'reportBatchGenerateSchema',
        response: 'DailyReport[]',
      },
      {
        method: 'PUT',
        path: '/api/daily-reports/:id',
        description: '更新日报内容',
        auth: true,
        params: { id: '日报ID' },
        body: 'reportUpdateSchema',
        response: 'DailyReport',
      },
      {
        method: 'DELETE',
        path: '/api/daily-reports/:id',
        description: '删除日报',
        auth: true,
        params: { id: '日报ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '照片墙',
    prefix: '/api/photos',
    endpoints: [
      {
        method: 'GET',
        path: '/api/photos',
        description: '获取当前用户所有照片',
        auth: true,
        response: 'Photo[]',
      },
      {
        method: 'POST',
        path: '/api/photos',
        description: '创建照片记录',
        auth: true,
        body: 'photoSchema',
        response: 'Photo',
      },
      {
        method: 'POST',
        path: '/api/photos/upload',
        description: '上传图片文件（multipart/form-data，字段名 file，限 JPG/PNG/GIF/WEBP，最大 10MB）',
        auth: true,
        response: '{ url: string }',
      },
      {
        method: 'PUT',
        path: '/api/photos/:id',
        description: '更新照片信息',
        auth: true,
        params: { id: '照片ID' },
        body: 'photoUpdateSchema',
        response: 'Photo',
      },
      {
        method: 'DELETE',
        path: '/api/photos/:id',
        description: '删除照片',
        auth: true,
        params: { id: '照片ID' },
        response: 'null',
      },
    ],
  },
  {
    name: '数据导入导出',
    prefix: '/api',
    endpoints: [
      {
        method: 'GET',
        path: '/api/export',
        description: '导出当前用户所有数据',
        auth: true,
        response: '{ version: string, exportedAt: string, data: { todos, diaries, memos, expenses, habits, habitChecks, pomodoros } }',
      },
      {
        method: 'POST',
        path: '/api/import',
        description: '导入数据（每表最多1000条）',
        auth: true,
        body: '{ version: string, data: { todos?, diaries?, memos?, expenses?, habits?, habitChecks?, pomodoros? } }',
        response: 'Record<string, { success: number, failed: number }>',
      },
    ],
  },
  {
    name: '系统',
    prefix: '/api',
    endpoints: [
      {
        method: 'GET',
        path: '/api/health',
        description: '健康检查（无需认证）',
        auth: false,
        response: '{ status: "ok", timestamp: string }',
      },
    ],
  },
]

// Schema 定义详情（从 validators.ts 同步）
const schemas: Record<string, Record<string, string>> = {
  todoCreateSchema: {
    title: 'string, 必填, 1-200字',
    priority: "'high' | 'medium' | 'low', 默认 'medium'",
    due_date: 'string (YYYY-MM-DD), 可选, 可null',
    parent_id: 'number, 可选, 可null (父待办ID)',
  },
  todoUpdateSchema: {
    title: 'string, 可选, 1-200字',
    completed: 'boolean, 可选',
    priority: "'high' | 'medium' | 'low', 可选",
    due_date: 'string (YYYY-MM-DD), 可选, 可null',
    _note: '至少提供一个字段',
  },
  diarySchema: {
    title: 'string, 必填, 1-200字',
    content: 'string, 最大10000字, 默认空',
    mood: 'string, 最大50字, 默认空',
    date: 'string (YYYY-MM-DD), 必填',
  },
  memoSchema: {
    title: 'string, 必填, 1-200字',
    content: 'string, 最大50000字, 默认空',
    encrypted: 'boolean, 默认 false',
  },
  expenseCreateSchema: {
    type: "'income' | 'expense', 必填",
    amount: 'number, 必填, 大于0',
    category: 'string, 必填, 1-50字',
    note: 'string, 最大500字, 默认空',
    date: 'string (YYYY-MM-DD), 必填',
  },
  habitCreateSchema: {
    name: 'string, 必填, 1-100字',
  },
  habitUpdateSchema: {
    name: 'string, 可选, 1-100字',
    archived: 'boolean, 可选',
  },
  habitCheckSchema: {
    habitId: 'string (UUID), 必填',
    date: 'string (YYYY-MM-DD), 必填',
    checked: 'boolean, 必填',
  },
  pomodoroCreateSchema: {
    duration: 'number, 必填, 整数, 1-7200 (秒)',
  },
  countdownSchema: {
    title: 'string, 必填, 1-100字',
    date: 'string (YYYY-MM-DD), 必填',
  },
  dailyPlanCreateSchema: {
    date: 'string (YYYY-MM-DD), 必填',
    note: 'string, 最大1000字, 默认空',
    items: 'Array<{ title: string(1-200字), sort_order: number }>, 必填, 至少1项',
  },
  dailyPlanUpdateSchema: {
    note: 'string, 最大1000字, 可选',
  },
  planItemCreateSchema: {
    plan_id: 'number, 必填, 正整数',
    title: 'string, 必填, 1-200字',
    sort_order: 'number, 默认0',
  },
  planItemUpdateSchema: {
    title: 'string, 可选, 1-200字',
    completed: 'boolean, 可选',
    sort_order: 'number, 可选',
    _note: '至少提供一个字段',
  },
  planItemBatchSchema: {
    plan_id: 'number, 必填, 正整数',
    items: 'Array<{ title: string(1-200字), sort_order: number }>, 必填, 至少1项',
  },
  reportGenerateSchema: {
    date: 'string (YYYY-MM-DD), 必填',
    carry_forward_item_ids: 'number[], 默认 []',
    empty: 'boolean, 默认 false (是否生成空日报)',
  },
  reportUpdateSchema: {
    content: 'string, 最大10000字',
  },
  reportBatchGenerateSchema: {
    from: 'string (YYYY-MM-DD), 必填',
    to: 'string (YYYY-MM-DD), 必填',
  },
  photoSchema: {
    url: 'string, 必填',
    title: 'string, 最大200字, 默认空',
    description: 'string, 最大1000字, 默认空',
  },
  photoUpdateSchema: {
    title: 'string, 最大200字, 可选',
    description: 'string, 最大1000字, 可选',
    _note: '至少提供一个字段',
  },
}

// 通用响应格式
const responseFormat = {
  success: '{ code: 200, data: T, message: "ok", traceId: string }',
  fail: '{ code: number, data: null, message: string, traceId: string }',
  commonCodes: {
    200: '成功',
    400: '请求参数错误',
    401: '未登录或登录已过期',
    500: '服务器内部错误',
  },
}

export default defineEventHandler((event) => {
  return success({
    title: 'ToolBox API 文档',
    version: '1.0',
    responseFormat,
    modules: docs,
    schemas,
  }, event)
})
