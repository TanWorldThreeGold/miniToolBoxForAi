<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">TODO</h1>

    <!-- 添加 -->
    <form @submit.prevent="addTodo" class="flex gap-2 mb-4">
      <input
        v-model="newTitle"
        type="text"
        placeholder="添加待办事项..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        :disabled="!newTitle.trim()"
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
      >
        添加
      </button>
    </form>

    <!-- 筛选 -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="f in filters"
        :key="f.key"
        @click="filter = f.key"
        class="px-3 py-1 rounded-lg text-sm transition"
        :class="filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 列表 -->
    <div class="space-y-2">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 group"
      >
        <button
          @click="toggleTodo(todo)"
          class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition"
          :class="todo.completed ? 'bg-accent border-accent text-white' : 'border-gray-300 hover:border-accent'"
        >
          <span v-if="todo.completed" class="text-xs">✓</span>
        </button>

        <!-- 编辑模式 -->
        <input
          v-if="editingId === todo.id"
          v-model="editingTitle"
          @keyup.enter="saveEdit(todo)"
          @keyup.escape="editingId = null"
          @blur="saveEdit(todo)"
          class="flex-1 px-2 py-1 border border-accent rounded focus:outline-none"
          ref="editInput"
        />
        <!-- 显示模式 -->
        <span
          v-else
          class="flex-1 text-gray-900 cursor-pointer"
          :class="{ 'line-through text-gray-400': todo.completed }"
          @dblclick="startEdit(todo)"
        >
          {{ todo.title }}
        </span>

        <button
          @click="deleteTodo(todo.id)"
          class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
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
const newTitle = ref('')
const editingId = ref<number | null>(null)
const editingTitle = ref('')
const filter = ref<'all' | 'active' | 'done'>('all')

const filters = [
  { key: 'all' as const, label: '全部' },
  { key: 'active' as const, label: '未完成' },
  { key: 'done' as const, label: '已完成' },
]

const todos = ref<Todo[]>([])
const loading = ref(true)

const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.completed)
  if (filter.value === 'done') return todos.value.filter(t => t.completed)
  return todos.value
})

async function fetchTodos() {
  loading.value = true
  const res = await api<Todo[]>('/api/todos')
  if (res.code === 200) todos.value = res.data || []
  loading.value = false
}

async function addTodo() {
  if (!newTitle.value.trim()) return
  const res = await api<Todo>('/api/todos', { method: 'POST', body: { title: newTitle.value.trim() } })
  if (res.code === 200 && res.data) {
    todos.value.unshift(res.data)
    newTitle.value = ''
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
}

async function saveEdit(todo: Todo) {
  if (!editingId.value) return
  const trimmed = editingTitle.value.trim()
  if (!trimmed || trimmed === todo.title) {
    editingId.value = null
    return
  }
  const prev = todo.title
  todo.title = trimmed
  editingId.value = null
  const res = await api('/api/todos/' + todo.id, { method: 'PUT', body: { title: trimmed } })
  if (res.code !== 200) todo.title = prev
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
