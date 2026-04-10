<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">日记</h1>
      <button
        v-if="!editing"
        @click="startNew"
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
      >
        写日记
      </button>
    </div>

    <!-- 编辑 -->
    <div v-if="editing" class="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
      <div class="flex gap-2">
        <input
          v-model="form.date"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          v-model="form.mood"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">选择心情</option>
          <option value="😊">😊 开心</option>
          <option value="😐">😐 平静</option>
          <option value="😢">😢 难过</option>
          <option value="😡">😡 生气</option>
          <option value="😴">😴 疲惫</option>
        </select>
      </div>
      <input
        v-model="form.title"
        type="text"
        placeholder="标题（可选）"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        v-model="form.content"
        rows="8"
        placeholder="今天发生了什么..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      <div class="flex gap-2">
        <button
          @click="saveDiary"
          class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          保存
        </button>
        <button
          @click="editing = false"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="space-y-3">
      <div
        v-for="d in diaries"
        :key="d.id"
        class="bg-white border border-gray-200 rounded-xl p-4 group cursor-pointer hover:shadow-sm transition"
        @click="editDiary(d)"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">{{ d.date }}</span>
            <span v-if="d.mood">{{ d.mood }}</span>
          </div>
          <button
            @click.stop="deleteDiary(d.id)"
            class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
        <h3 v-if="d.title" class="font-medium text-gray-900 mb-1">{{ d.title }}</h3>
        <p class="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{{ d.content }}</p>
      </div>
      <p v-if="diaries.length === 0 && !editing" class="text-gray-400 text-center py-8">
        还没有日记，点击"写日记"开始
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const editing = ref(false)
const editingId = ref<number | null>(null)
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: '',
  content: '',
  mood: '',
  date: today,
})

interface Diary {
  id: number
  title: string
  content: string
  mood: string
  date: string
}

const diaries = ref<Diary[]>([])

function startNew() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.mood = ''
  form.date = today
  editing.value = true
}

function editDiary(d: Diary) {
  editingId.value = d.id
  form.title = d.title || ''
  form.content = d.content || ''
  form.mood = d.mood || ''
  form.date = d.date
  editing.value = true
}

async function saveDiary() {
  if (!form.content.trim()) return

  if (editingId.value) {
    const { data } = await supabase
      .from('diaries')
      .update({ title: form.title, content: form.content, mood: form.mood, date: form.date })
      .eq('id', editingId.value)
      .select()
      .single()
    if (data) {
      const idx = diaries.value.findIndex(d => d.id === editingId.value)
      if (idx !== -1) diaries.value[idx] = data
    }
  } else {
    const { data } = await supabase
      .from('diaries')
      .insert({
        user_id: user.value!.id,
        title: form.title,
        content: form.content,
        mood: form.mood,
        date: form.date,
      })
      .select()
      .single()
    if (data) diaries.value.unshift(data)
  }
  editing.value = false
}

async function deleteDiary(id: number) {
  diaries.value = diaries.value.filter(d => d.id !== id)
  await supabase.from('diaries').delete().eq('id', id)
}

async function fetchDiaries() {
  const { data } = await supabase
    .from('diaries')
    .select('*')
    .eq('user_id', user.value!.id)
    .order('date', { ascending: false })
  diaries.value = data || []
}

onMounted(fetchDiaries)
</script>
