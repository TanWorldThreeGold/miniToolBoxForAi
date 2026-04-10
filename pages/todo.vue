<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">TODO</h1>

    <!-- 添加 -->
    <form @submit.prevent="addTodo" class="flex gap-2 mb-6">
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

    <!-- 列表 -->
    <div class="space-y-2">
      <div
        v-for="todo in todos"
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
        <span
          class="flex-1 text-gray-900"
          :class="{ 'line-through text-gray-400': todo.completed }"
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
      <p v-if="todos.length === 0" class="text-gray-400 text-center py-8">暂无待办事项</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const newTitle = ref('')

interface Todo {
  id: number
  title: string
  completed: boolean
  sort_order: number
}

const todos = ref<Todo[]>([])

async function fetchTodos() {
  const { data } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.value!.id)
    .order('created_at', { ascending: false })
  todos.value = data || []
}

async function addTodo() {
  if (!newTitle.value.trim()) return
  const { data } = await supabase
    .from('todos')
    .insert({ title: newTitle.value.trim(), user_id: user.value!.id })
    .select()
    .single()
  if (data) {
    todos.value.unshift(data)
    newTitle.value = ''
  }
}

async function toggleTodo(todo: Todo) {
  todo.completed = !todo.completed
  await supabase.from('todos').update({ completed: todo.completed }).eq('id', todo.id)
}

async function deleteTodo(id: number) {
  todos.value = todos.value.filter(t => t.id !== id)
  await supabase.from('todos').delete().eq('id', id)
}

onMounted(fetchTodos)
</script>
