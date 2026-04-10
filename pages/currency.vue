<template>
  <div class="max-w-sm mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">汇率换算</h1>

    <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <!-- 金额 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
        <input
          v-model.number="amount"
          type="number"
          min="0"
          step="0.01"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg"
        />
      </div>

      <!-- From -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">从</label>
        <select
          v-model="fromCurrency"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option v-for="c in currencies" :key="c.code" :value="c.code">
            {{ c.code }} - {{ c.name }}
          </option>
        </select>
      </div>

      <!-- 互换 -->
      <div class="text-center">
        <button
          @click="swap"
          class="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
        >
          ↕
        </button>
      </div>

      <!-- To -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">到</label>
        <select
          v-model="toCurrency"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option v-for="c in currencies" :key="c.code" :value="c.code">
            {{ c.code }} - {{ c.name }}
          </option>
        </select>
      </div>

      <!-- 结果 -->
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p v-if="loading" class="text-gray-400">加载中...</p>
        <p v-else-if="result !== null" class="text-2xl font-bold text-gray-900">
          {{ result.toFixed(2) }} {{ toCurrency }}
        </p>
        <p v-if="rate && !loading" class="text-sm text-gray-400 mt-1">
          1 {{ fromCurrency }} = {{ rate.toFixed(4) }} {{ toCurrency }}
        </p>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center mt-4">
      数据来源：ExchangeRate API（可能有延迟）
    </p>
  </div>
</template>

<script setup lang="ts">
const amount = ref(100)
const fromCurrency = ref('CNY')
const toCurrency = ref('USD')
const rate = ref<number | null>(null)
const result = ref<number | null>(null)
const loading = ref(false)

const currencies = [
  { code: 'CNY', name: '人民币' },
  { code: 'USD', name: '美元' },
  { code: 'EUR', name: '欧元' },
  { code: 'JPY', name: '日元' },
  { code: 'GBP', name: '英镑' },
  { code: 'KRW', name: '韩元' },
  { code: 'HKD', name: '港币' },
  { code: 'TWD', name: '新台币' },
  { code: 'SGD', name: '新加坡元' },
  { code: 'AUD', name: '澳元' },
  { code: 'CAD', name: '加元' },
]

function swap() {
  const tmp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = tmp
}

async function fetchRate() {
  loading.value = true
  try {
    const res = await $fetch<Record<string, any>>(
      `https://open.er-api.com/v6/latest/${fromCurrency.value}`
    )
    if (res.rates) {
      rate.value = res.rates[toCurrency.value]
      result.value = amount.value * rate.value!
    }
  } catch {
    rate.value = null
    result.value = null
  }
  loading.value = false
}

watch([amount, fromCurrency, toCurrency], fetchRate, { immediate: true })
</script>
