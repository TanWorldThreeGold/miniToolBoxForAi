export interface Todo {
  id: number
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  due_date: string | null
  parent_id: number | null
  sort_order: number
  children?: Todo[]
}

export interface Diary {
  id: number
  title: string
  content: string
  mood: string
  date: string
}

export interface Memo {
  id?: number
  title: string
  content: string
  encrypted?: boolean
}

export interface Expense {
  id: number
  type: string
  amount: number
  category: string
  note: string
  date: string
}

export interface Habit {
  id: string
  name: string
  archived: boolean
  streak: number
  last30: { date: string; checked: boolean }[]
}

export interface Pomodoro {
  id: number
  duration: number
  created_at: string
}

export interface PlanItem {
  id: number
  plan_id: number
  title: string
  completed: boolean
  sort_order: number
  carried_from_report_id: number | null
}

export interface DailyPlan {
  id: number
  date: string
  note: string
  items?: PlanItem[]
  created_at: string
  updated_at: string
}

export interface DailyReport {
  id: number
  plan_id: number | null
  date: string
  auto_summary: string
  content: string
  created_at: string
  updated_at: string
}
