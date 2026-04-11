<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">TODO</h1>

    <form @submit.prevent="addTodo" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 space-y-3">
      <input
        v-model="newTodo.title"
        type="text"
        placeholder="添加待办事项..."
        required
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div class="flex gap-2">
        <select
          v-model="newTodo.priority"
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <input
          v-model="newTodo.due_date"
          type="date"
          class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        />
      </div>
      <button
        type="submit"
        :disabled="!newTodo.title.trim()"
        class="w-full py-2 bg-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        添加
      </button>
    </form>

    <div class="flex gap-2 mb-4">
      <button
        v-for="f in filters"
        :key="f.key"
        @click="filter = f.key"
        class="px-3 py-1 rounded-lg text-sm transition"
        :class="filter === f.key ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 group"
      >
        <div class="flex items-center gap-3">
          <button
            @click="toggleTodo(todo)"
            class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition"
            :class="todo.completed ? 'bg-accent border-accent text-white' : 'border-gray-300 dark:border-gray-600 hover:border-accent'"
          >
            <span v-if="todo.completed" class="text-xs">✓</span>
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="text-gray-900 dark:text-white cursor-pointer truncate"
                :class="{ 'line-through text-gray-400 dark:text-gray-500': todo.completed }"
                @dblclick="startEdit(todo)"
              >
                {{ todo.title }}
              </span>
              <span
                v-if="todo.priority === 'high'"
                class="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded"
              >高</span>
              <span
                v-else-if="todo.priority === 'low'"
                class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded"
              >低</span>
            </div>
            <p v-if="todo.due_date" class="text-xs mt-1" :class="isOverdue(todo.due_date) && !todo.completed ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'">
              截止: {{ todo.due_date }}
              <span v-if="isOverdue(todo.due_date) && !todo.completed">(已过期)</span>
            </p>
          </div>

          <button
            @click="deleteTodo(todo.id)"
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>

        <div v-if="editingId === todo.id" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <input
            v-model="editingTitle"
            @keyup.enter="saveEdit(todo)"
            @keyup.escape="editingId = null"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
          <div class="flex gap-2">
            <select v-model="editingPriority" class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
            <input
              v-model="editingDueDate"
              type="date"
              class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex gap-2">
            <button @click="saveEdit(todo)" class="flex-1 py-2 bg-accent text-white rounded-lg">保存</button>
            <button @click="editingId = null" class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">取消</button>
          </div>
        </div>
      </div>

      <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
      <p v-else-if="filteredTodos.length === 0" class="text-gray-400 text-center py-8">
        {{ filter === 'all' ? '暂无待办事项' : '无匹配项' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()

const newTodo = ref({
  title: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  due_date: '',
})

const editingId = ref<number | null>(null)
const editingTitle = ref('')
const editingPriority = ref<'high' | 'medium' | 'low'>('medium')
const editingDueDate = ref('')
const filter = ref<'all' | 'active' | 'done'>('all')

const filters = [
  { key: 'all' as const, label: '全部' },
  { key: 'active' as const, label: '未完成' },
  { key: 'done' as const, label: '已完成' },
]

const todos = ref<Todo[]>([])
const loading = ref(true)

const filteredTodos = computed(() => {
  let result = todos.value
  if (filter.value === 'active') result = result.filter(t => !t.completed)
  if (filter.value === 'done') result = result.filter(t => t.completed)
  return result.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

function isOverdue(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  return due < today
}

async function fetchTodos() {
  loading.value = true
  const res = await api<Todo[]>('/api/todos')
  if (res.code === 200) todos.value = res.data || []
  loading.value = false
}

async function addTodo() {
  if (!newTodo.value.title.trim()) return
  const res = await api<Todo>('/api/todos', {
    method: 'POST',
    body: {
      title: newTodo.value.title.trim(),
      priority: newTodo.value.priority,
      due_date: newTodo.value.due_date || null,
    },
  })
  if (res.code === 200 && res.data) {
    todos.value.unshift(res.data)
    newTodo.value = { title: '', priority: 'medium', due_date: '' }
  }
}

async function toggleTodo(todo: Todo) {
  todo.completed = !todo.completed
  const res = await api('/api/todos/' + todo.id, { method: 'PUT', body: { completed: todo.completed } })
  if (res.code !== 200) todo.completed = !todo.completed
}

function startEdit(todo: Todo) {
  editingId.value = todo.id
  editingTitle.value = todo.title
  editingPriority.value = todo.priority
  editingDueDate.value = todo.due_date || ''
}

async function saveEdit(todo: Todo) {
  if (!editingId.value) return
  const trimmed = editingTitle.value.trim()
  if (!trimmed) return

  const updates: any = { title: trimmed, priority: editingPriority.value }
  if (editingDueDate.value) updates.due_date = editingDueDate.value

  const prev = { title: todo.title, priority: todo.priority, due_date: todo.due_date }
  todo.title = trimmed
  todo.priority = editingPriority.value
  todo.due_date = editingDueDate.value || null
  editingId.value = null

  const res = await api('/api/todos/' + todo.id, { method: 'PUT', body: updates })
  if (res.code !== 200) {
    todo.title = prev.title
    todo.priority = prev.priority
    todo.due_date = prev.due_date
  }
}

async function deleteTodo(id: number) {
  if (!await confirm('确定删除这条待办事项？')) return
  const prev = todos.value
  todos.value = todos.value.filter(t => t.id !== id)
  const res = await api('/api/todos/' + id, { method: 'DELETE' })
  if (res.code !== 200) todos.value = prev
}

onMounted(fetchTodos)
</script>
