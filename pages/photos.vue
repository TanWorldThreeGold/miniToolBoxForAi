<template>
  <div @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop">
    <!-- 顶部栏 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">照片墙</h1>
      <div class="flex items-center gap-2">
        <!-- 搜索 -->
        <div v-if="photos.length > 0" class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索照片..."
            class="w-40 px-3 py-1.5 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>
        <!-- 布局切换 -->
        <div v-if="photos.length > 0" class="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            @click="layout = 'waterfall'"
            class="px-2 py-1.5 text-sm transition"
            :class="layout === 'waterfall' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
            title="瀑布流"
          >▦</button>
          <button
            @click="layout = 'grid'"
            class="px-2 py-1.5 text-sm transition"
            :class="layout === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
            title="网格"
          >⊞</button>
        </div>
        <!-- 上传 -->
        <button
          @click="openUpload"
          class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
        >
          上传照片
        </button>
      </div>
    </div>

    <!-- 拖拽覆盖层 -->
    <div
      v-if="dragActive"
      class="fixed inset-0 z-[70] bg-blue-500/20 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <div class="text-5xl mb-3">📷</div>
        <p class="text-lg font-medium text-gray-900">释放以上传照片</p>
        <p class="text-sm text-gray-500 mt-1">支持 JPG/PNG/GIF/WEBP</p>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUpload" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showUpload = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
        <h2 class="text-lg font-bold text-gray-900">上传照片</h2>
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition min-h-[120px] flex items-center justify-center"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleUploadDrop"
        >
          <div v-if="previewFiles.length > 0" class="w-full">
            <div class="flex flex-wrap gap-2 justify-center">
              <div v-for="(pf, i) in previewFiles" :key="i" class="relative group">
                <img :src="pf.preview" class="w-20 h-20 object-cover rounded-lg" />
                <button
                  @click.stop="removePreviewFile(i)"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >✕</button>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">已选 {{ previewFiles.length }} 张，点击继续添加</p>
          </div>
          <div v-else>
            <div class="text-4xl mb-2">📷</div>
            <p class="text-sm text-gray-500">点击选择或拖拽图片到此处</p>
            <p class="text-xs text-gray-400 mt-1">支持 JPG/PNG/GIF/WEBP，单张最大 10MB</p>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" @change="handleFileChange" />
        <!-- 上传进度 -->
        <div v-if="uploadProgress.total > 0" class="space-y-1">
          <div class="flex justify-between text-xs text-gray-500">
            <span>上传进度</span>
            <span>{{ uploadProgress.done }} / {{ uploadProgress.total }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-gray-900 h-2 rounded-full transition-all" :style="{ width: (uploadProgress.total ? uploadProgress.done / uploadProgress.total * 100 : 0) + '%' }"></div>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="uploadPhotos"
            :disabled="uploading || previewFiles.length === 0"
            class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploading ? '上传中...' : `上传 (${previewFiles.length})` }}
          </button>
          <button
            @click="showUpload = false"
            :disabled="uploading"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 灯箱查看 -->
    <div v-if="viewingPhoto" class="fixed inset-0 z-50 bg-black/90 flex flex-col" @keydown.left="prevPhoto" @keydown.right="nextPhoto" @keydown.escape="viewingPhoto = null">
      <!-- 顶部工具栏 -->
      <div class="flex items-center justify-between p-3 shrink-0">
        <div class="text-white text-sm">
          <span v-if="viewingPhoto.title" class="font-medium">{{ viewingPhoto.title }}</span>
          <span class="text-gray-400 ml-2">{{ viewingIndex + 1 }} / {{ filteredPhotos.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="zoomIn" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="放大">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
          </button>
          <button @click="zoomOut" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="缩小">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
          </button>
          <button @click="resetZoom" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="重置">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <button @click="downloadPhoto(viewingPhoto)" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="下载">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </button>
          <button @click="openEdit(viewingPhoto)" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="编辑">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button @click="deletePhoto(viewingPhoto)" class="p-2 text-white/70 hover:text-red-400 transition rounded-lg hover:bg-white/10" title="删除">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <button @click="viewingPhoto = null" class="p-2 text-white/70 hover:text-white transition rounded-lg hover:bg-white/10" title="关闭">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- 图片区域 -->
      <div class="flex-1 relative overflow-hidden flex items-center justify-center" @click.self="viewingPhoto = null">
        <!-- 上一张 -->
        <button
          v-if="viewingIndex > 0"
          @click.stop="prevPhoto"
          class="absolute left-3 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>

        <img
          :src="viewingPhoto.url"
          :alt="viewingPhoto.title"
          class="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
          :style="{ transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)` }"
          @wheel.prevent="onWheel"
          @mousedown.prevent="startPan"
        />

        <!-- 下一张 -->
        <button
          v-if="viewingIndex < filteredPhotos.length - 1"
          @click.stop="nextPhoto"
          class="absolute right-3 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- 底部信息 -->
      <div v-if="viewingPhoto.description || viewingPhoto.created_at" class="p-3 text-center shrink-0">
        <p v-if="viewingPhoto.description" class="text-gray-300 text-sm">{{ viewingPhoto.description }}</p>
        <p class="text-gray-500 text-xs mt-1">{{ formatDate(viewingPhoto.created_at) }}</p>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editingPhoto" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="editingPhoto = null">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
        <h2 class="text-lg font-bold text-gray-900">编辑照片</h2>
        <img :src="editingPhoto.url" class="max-h-48 mx-auto rounded-lg object-contain" />
        <input
          v-model="editForm.title"
          type="text"
          placeholder="标题（可选）"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <textarea
          v-model="editForm.description"
          rows="2"
          placeholder="描述（可选）"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        <div class="flex gap-2">
          <button @click="saveEdit" class="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">保存</button>
          <button @click="editingPhoto = null" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">取消</button>
        </div>
      </div>
    </div>

    <!-- 照片墙 -->
    <template v-if="photos.length > 0">
      <!-- 瀑布流 -->
      <div v-if="layout === 'waterfall' && filteredPhotos.length > 0" class="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        <div
          v-for="p in filteredPhotos"
          :key="p.id"
          class="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl"
          @click="viewPhoto(p)"
        >
          <img
            :src="p.url"
            :alt="p.title"
            class="w-full rounded-xl hover:opacity-90 transition object-cover"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <p v-if="p.title" class="text-white text-sm font-medium truncate">{{ p.title }}</p>
              <p v-if="p.description" class="text-gray-200 text-xs truncate">{{ p.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 网格 -->
      <div v-if="layout === 'grid' && filteredPhotos.length > 0" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        <div
          v-for="p in filteredPhotos"
          :key="p.id"
          class="group cursor-pointer relative overflow-hidden rounded-lg aspect-square"
          @click="viewPhoto(p)"
        >
          <img
            :src="p.url"
            :alt="p.title"
            class="w-full h-full object-cover hover:opacity-90 transition"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p v-if="p.title" class="absolute bottom-1 left-2 right-2 text-white text-xs truncate">{{ p.title }}</p>
          </div>
        </div>
      </div>

      <!-- 搜索无结果 -->
      <div v-if="filteredPhotos.length === 0 && searchQuery" class="text-center py-16">
        <div class="text-4xl mb-3">🔍</div>
        <p class="text-gray-400">未找到匹配的照片</p>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="text-center py-16">
      <div class="text-5xl mb-4">📷</div>
      <p class="text-gray-400 mb-4">还没有照片</p>
      <p class="text-gray-400 text-sm">点击"上传照片"或直接拖拽图片到页面</p>
    </div>

    <p v-if="loading" class="text-gray-400 text-center py-8">加载中...</p>
  </div>
</template>

<script setup lang="ts">
import type { Photo } from '~/types'

const { api } = useApi()
const { confirm } = useConfirm()
const { toast } = useToast()

const photos = ref<Photo[]>([])
const loading = ref(true)
const showUpload = ref(false)
const uploading = ref(false)
const viewingPhoto = ref<Photo | null>(null)
const editingPhoto = ref<Photo | null>(null)
const searchQuery = ref('')
const layout = ref<'waterfall' | 'grid'>('waterfall')
const fileInput = ref<HTMLInputElement | null>(null)

// 批量上传
const previewFiles = ref<{ file: File; preview: string }[]>([])
const uploadProgress = reactive({ done: 0, total: 0 })

// 缩放 & 平移
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStart = reactive({ x: 0, y: 0, panX: 0, panY: 0 })

const editForm = reactive({ title: '', description: '' })

// 过滤
const filteredPhotos = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return photos.value
  return photos.value.filter(p =>
    (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  )
})

const viewingIndex = computed(() => {
  if (!viewingPhoto.value) return 0
  return filteredPhotos.value.findIndex(p => p.id === viewingPhoto.value!.id)
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// === 拖拽上传（全局） ===
const dragActive = ref(false)
let dragCounter = 0

function onDragOver() {
  dragCounter++
  dragActive.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    dragActive.value = false
  }
}

function onDrop(e: DragEvent) {
  dragCounter = 0
  dragActive.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  addFiles(files)
}

// === 上传弹窗 ===
function openUpload() {
  previewFiles.value = []
  uploadProgress.done = 0
  uploadProgress.total = 0
  showUpload.value = true
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  addFiles(input.files)
  input.value = ''
}

function handleUploadDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (!files) return
  addFiles(files)
}

function addFiles(fileList: FileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue
    if (previewFiles.value.length >= 20) break
    const preview = URL.createObjectURL(file)
    previewFiles.value.push({ file, preview })
  }
  if (!showUpload.value && previewFiles.value.length > 0) {
    showUpload.value = true
  }
}

function removePreviewFile(index: number) {
  URL.revokeObjectURL(previewFiles.value[index].preview)
  previewFiles.value.splice(index, 1)
}

async function uploadPhotos() {
  if (previewFiles.value.length === 0) return
  uploading.value = true
  uploadProgress.total = previewFiles.value.length
  uploadProgress.done = 0

  let successCount = 0

  for (const pf of previewFiles.value) {
    const formData = new FormData()
    formData.append('file', pf.file)

    const uploadRes = await api<{ url: string }>('/api/photos/upload', {
      method: 'POST',
      body: formData,
    })

    if (uploadRes.code === 200 && uploadRes.data) {
      const res = await api<Photo>('/api/photos', {
        method: 'POST',
        body: { url: uploadRes.data.url },
      })
      if (res.code === 200 && res.data) {
        photos.value.unshift(res.data)
        successCount++
      } else {
        toast(res.message || '保存照片失败', 'error')
      }
    } else {
      toast(uploadRes.message || '上传失败', 'error')
    }

    uploadProgress.done++
    URL.revokeObjectURL(pf.preview)
  }

  uploading.value = false
  showUpload.value = false
  previewFiles.value = []
  uploadProgress.done = 0
  uploadProgress.total = 0

  if (successCount > 0) {
    toast(`成功上传 ${successCount} 张照片`, 'success')
  }
}

// === 灯箱 ===
function viewPhoto(p: Photo) {
  viewingPhoto.value = p
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function prevPhoto() {
  if (viewingIndex.value > 0) {
    viewingPhoto.value = filteredPhotos.value[viewingIndex.value - 1]
    resetZoom()
  }
}

function nextPhoto() {
  if (viewingIndex.value < filteredPhotos.value.length - 1) {
    viewingPhoto.value = filteredPhotos.value[viewingIndex.value + 1]
    resetZoom()
  }
}

// === 缩放 & 平移 ===
function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value * 1.3, 8)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value / 1.3, 0.5)
  if (zoomLevel.value <= 1) { panX.value = 0; panY.value = 0 }
}

function resetZoom() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function onWheel(e: WheelEvent) {
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

function startPan(e: MouseEvent) {
  if (zoomLevel.value <= 1) return
  isPanning.value = true
  panStart.x = e.clientX
  panStart.y = e.clientY
  panStart.panX = panX.value
  panStart.panY = panY.value

  const onMove = (ev: MouseEvent) => {
    if (!isPanning.value) return
    panX.value = panStart.panX + (ev.clientX - panStart.x)
    panY.value = panStart.panY + (ev.clientY - panStart.y)
  }
  const onUp = () => {
    isPanning.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// === 下载 ===
function downloadPhoto(p: Photo) {
  const a = document.createElement('a')
  a.href = p.url
  a.download = p.title || `photo-${p.id}`
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// === 编辑 ===
function openEdit(p: Photo) {
  editingPhoto.value = p
  editForm.title = p.title
  editForm.description = p.description
  viewingPhoto.value = null
}

async function saveEdit() {
  if (!editingPhoto.value) return
  const res = await api<Photo>(`/api/photos/${editingPhoto.value.id}`, {
    method: 'PUT',
    body: { title: editForm.title, description: editForm.description },
  })
  if (res.code === 200 && res.data) {
    const idx = photos.value.findIndex(p => p.id === editingPhoto.value!.id)
    if (idx !== -1) photos.value[idx] = res.data
  }
  editingPhoto.value = null
}

// === 删除 ===
async function deletePhoto(p: Photo) {
  if (!await confirm('确定删除这张照片？')) return
  const prev = photos.value
  photos.value = photos.value.filter(ph => ph.id !== p.id)
  viewingPhoto.value = null
  const res = await api(`/api/photos/${p.id}`, { method: 'DELETE' })
  if (res.code !== 200) photos.value = prev
}

// === 键盘 ===
function onKeyDown(e: KeyboardEvent) {
  if (!viewingPhoto.value) return
  if (e.key === 'ArrowLeft') prevPhoto()
  else if (e.key === 'ArrowRight') nextPhoto()
  else if (e.key === 'Escape') viewingPhoto.value = null
}

// === 加载 ===
async function fetchPhotos() {
  loading.value = true
  const res = await api<Photo[]>('/api/photos')
  if (res.code === 200) photos.value = res.data || []
  loading.value = false
}

onMounted(() => {
  fetchPhotos()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>
