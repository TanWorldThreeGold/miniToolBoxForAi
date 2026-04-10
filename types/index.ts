export interface Todo {
  id: number
  title: string
  completed: boolean
  sort_order: number
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
  id: number
  name: string
  checkedToday: boolean
  streak: number
  last7: { date: string; label: string; checked: boolean }[]
}

export interface Pomodoro {
  id: number
  duration: number
  created_at: string
}
