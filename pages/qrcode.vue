<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">二维码生成器</h1>

    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">输入内容</label>
        <textarea
          v-model="inputText"
          placeholder="输入文本或网址..."
          rows="3"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">二维码尺寸</label>
        <div class="flex gap-2">
          <button
            v-for="s in sizes"
            :key="s"
            @click="size = s"
            class="px-4 py-2 rounded-lg text-sm transition"
            :class="size === s ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            {{ s }}x{{ s }}
          </button>
        </div>
      </div>

      <button
        @click="generateQR"
        :disabled="!inputText.trim()"
        class="w-full py-3 bg-accent text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
      >
        生成二维码
      </button>

      <div v-if="qrDataUrl" class="space-y-4">
        <div class="flex justify-center p-4 bg-white rounded-lg">
          <img :src="qrDataUrl" :alt="'QR Code'" :style="{ width: size + 'px', height: size + 'px' }" />
        </div>
        <div class="flex gap-2">
          <button
            @click="downloadQR"
            class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            下载图片
          </button>
          <button
            @click="copyQR"
            class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {{ copied ? '已复制' : '复制图片' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const inputText = ref('')
const size = ref(200)
const qrDataUrl = ref('')
const copied = ref(false)

const sizes = [150, 200, 300, 400]

async function generateQR() {
  if (!inputText.value.trim()) return

  const text = encodeURIComponent(inputText.value)
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&data=${text}`

  try {
    const response = await fetch(apiUrl)
    const blob = await response.blob()

    const reader = new FileReader()
    reader.onloadend = () => {
      qrDataUrl.value = reader.result as string
    }
    reader.readAsDataURL(blob)
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

function downloadQR() {
  if (!qrDataUrl.value) return

  const link = document.createElement('a')
  link.download = `qrcode-${Date.now()}.png`
  link.href = qrDataUrl.value
  link.click()
}

async function copyQR() {
  if (!qrDataUrl.value) return

  try {
    const response = await fetch(qrDataUrl.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>
