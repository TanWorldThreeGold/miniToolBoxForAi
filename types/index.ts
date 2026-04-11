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
