<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">API 文档</h1>
      <span class="text-xs text-gray-400">自动同步，新增/修改接口后自动更新</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="doc">
      <!-- 响应格式说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">统一响应格式</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="bg-green-50 dark:bg-green-900/20 rounded p-3">
            <div class="font-medium text-green-700 dark:text-green-400 mb-1">成功响应</div>
            <code class="text-green-600 dark:text-green-300 break-all">{{ doc.responseFormat.success }}</code>
          </div>
          <div class="bg-red-50 dark:bg-red-900/20 rounded p-3">
            <div class="font-medium text-red-700 dark:text-red-400 mb-1">失败响应</div>
            <code class="text-red-600 dark:text-red-300 break-all">{{ doc.responseFormat.fail }}</code>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 text-xs">
          <span v-for="(label, code) in doc.responseFormat.commonCodes" :key="code"
            class="px-2 py-0.5 rounded-full"
            :class="Number(code) < 400 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
            {{ code }} {{ label }}
          </span>
        </div>
      </div>

      <!-- 模块列表 -->
      <div v-for="mod in doc.modules" :key="mod.name" class="space-y-2">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-mono">{{ mod.prefix }}</span>
          {{ mod.name }}
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                <th class="px-3 py-2 text-left font-medium">方法</th>
                <th class="px-3 py-2 text-left font-medium">路径</th>
                <th class="px-3 py-2 text-left font-medium">说明</th>
                <th class="px-3 py-2 text-left font-medium">认证</th>
                <th class="px-3 py-2 text-left font-medium">Body Schema</th>
                <th class="px-3 py-2 text-left font-medium">响应类型</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ep in mod.endpoints" :key="ep.method + ep.path"
                class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="px-3 py-2">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    :class="methodClass(ep.method)">
                    {{ ep.method }}
                  </span>
                </td>
                <td class="px-3 py-2 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ ep.path }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ ep.description }}</td>
                <td class="px-3 py-2">
                  <span v-if="ep.auth" class="text-yellow-600 dark:text-yellow-400">需要</span>
                  <span v-else class="text-gray-400">无需</span>
                </td>
                <td class="px-3 py-2">
                  <button v-if="ep.body && doc.schemas[ep.body]" @click="toggleSchema(ep.body)"
                    class="text-blue-600 dark:text-blue-400 hover:underline font-mono">
                    {{ ep.body }} {{ expandedSchemas.has(ep.body) ? '▲' : '▼' }}
                  </button>
                  <span v-else-if="ep.body" class="font-mono text-gray-500">{{ ep.body }}</span>
                  <span v-else class="text-gray-300 dark:text-gray-600">-</span>
                </td>
                <td class="px-3 py-2 font-mono text-gray-500 dark:text-gray-400">{{ ep.response || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 展开的 Schema 详情 -->
        <template v-for="ep in mod.endpoints" :key="'schema-' + ep.method + ep.path">
          <div v-if="ep.body && expandedSchemas.has(ep.body) && doc.schemas[ep.body]"
            class="ml-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs space-y-1">
            <div v-for="(desc, field) in doc.schemas[ep.body]" :key="field" class="flex gap-2">
              <span class="font-mono text-blue-600 dark:text-blue-400 shrink-0">{{ field }}:</span>
              <span class="text-gray-600 dark:text-gray-400">{{ desc }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ApiDoc {
  title: string
  version: string
  responseFormat: {
    success: string
    fail: string
    commonCodes: Record<string, string>
  }
  modules: {
    name: string
    prefix: string
    endpoints: {
      method: string
      path: string
      description: string
      auth: boolean
      body?: string
      response?: string
    }[]
  }[]
  schemas: Record<string, Record<string, string>>
}

const { api } = useApi()
const { data: doc, pending } = await useAsyncData('api-docs', () => api<ApiDoc>('/api/docs').then(r => r.code === 200 ? r.data : null))

const expandedSchemas = ref<Set<string>>(new Set())

function toggleSchema(name: string) {
  const s = new Set(expandedSchemas.value)
  if (s.has(name)) s.delete(name)
  else s.add(name)
  expandedSchemas.value = s
}

function methodClass(method: string) {
  switch (method) {
    case 'GET': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'POST': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    case 'PUT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    case 'DELETE': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
}
</script>
