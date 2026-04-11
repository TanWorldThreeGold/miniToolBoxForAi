<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">单位换算</h1>

    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">类型</label>
        <select
          v-model="category"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option v-for="cat in categories" :key="cat.key" :value="cat.key">{{ cat.name }}</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">从</label>
          <select
            v-model="fromUnit"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option v-for="u in currentUnits" :key="u.key" :value="u.key">{{ u.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">到</label>
          <select
            v-model="toUnit"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option v-for="u in currentUnits" :key="u.key" :value="u.key">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">输入值</label>
        <input
          v-model.number="inputValue"
          type="number"
          step="any"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          placeholder="输入数值"
        />
      </div>

      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p class="text-sm text-gray-500 dark:text-gray-400">结果</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ result || '0' }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ fromUnitName }} → {{ toUnitName }}</p>
      </div>

      <button
        @click="swapUnits"
        class="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        交换单位
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const category = ref('length')
const fromUnit = ref('m')
const toUnit = ref('km')
const inputValue = ref<number | null>(null)

const categories = [
  { key: 'length', name: '长度' },
  { key: 'weight', name: '重量' },
  { key: 'temperature', name: '温度' },
  { key: 'area', name: '面积' },
  { key: 'volume', name: '体积' },
  { key: 'speed', name: '速度' },
]

const units: Record<string, { key: string; name: string; toBase: number }[]> = {
  length: [
    { key: 'mm', name: '毫米', toBase: 0.001 },
    { key: 'cm', name: '厘米', toBase: 0.01 },
    { key: 'm', name: '米', toBase: 1 },
    { key: 'km', name: '千米', toBase: 1000 },
    { key: 'in', name: '英寸', toBase: 0.0254 },
    { key: 'ft', name: '英尺', toBase: 0.3048 },
    { key: 'yd', name: '码', toBase: 0.9144 },
    { key: 'mi', name: '英里', toBase: 1609.344 },
  ],
  weight: [
    { key: 'mg', name: '毫克', toBase: 0.000001 },
    { key: 'g', name: '克', toBase: 0.001 },
    { key: 'kg', name: '千克', toBase: 1 },
    { key: 't', name: '吨', toBase: 1000 },
    { key: 'oz', name: '盎司', toBase: 0.0283495 },
    { key: 'lb', name: '磅', toBase: 0.453592 },
  ],
  temperature: [
    { key: 'c', name: '摄氏度', toBase: 1 },
    { key: 'f', name: '华氏度', toBase: 1 },
    { key: 'k', name: '开尔文', toBase: 1 },
  ],
  area: [
    { key: 'mm2', name: '平方毫米', toBase: 0.000001 },
    { key: 'cm2', name: '平方厘米', toBase: 0.0001 },
    { key: 'm2', name: '平方米', toBase: 1 },
    { key: 'km2', name: '平方千米', toBase: 1000000 },
    { key: 'ha', name: '公顷', toBase: 10000 },
    { key: 'ac', name: '英亩', toBase: 4046.86 },
  ],
  volume: [
    { key: 'ml', name: '毫升', toBase: 0.001 },
    { key: 'l', name: '升', toBase: 1 },
    { key: 'm3', name: '立方米', toBase: 1000 },
    { key: 'gal', name: '加仑', toBase: 3.78541 },
  ],
  speed: [
    { key: 'ms', name: '米/秒', toBase: 1 },
    { key: 'kmh', name: '千米/时', toBase: 0.277778 },
    { key: 'mph', name: '英里/时', toBase: 0.44704 },
    { key: 'kn', name: '节', toBase: 0.514444 },
  ],
}

const currentUnits = computed(() => units[category.value] || [])

const fromUnitName = computed(() => {
  return currentUnits.value.find(u => u.key === fromUnit.value)?.name || ''
})

const toUnitName = computed(() => {
  return currentUnits.value.find(u => u.key === toUnit.value)?.name || ''
})

const result = computed(() => {
  if (inputValue.value === null || isNaN(inputValue.value)) return ''

  const from = currentUnits.value.find(u => u.key === fromUnit.value)
  const to = currentUnits.value.find(u => u.key === toUnit.value)

  if (!from || !to) return ''

  if (category.value === 'temperature') {
    return convertTemperature(inputValue.value, fromUnit.value, toUnit.value)
  }

  const baseValue = inputValue.value * from.toBase
  const resultValue = baseValue / to.toBase

  if (Math.abs(resultValue) < 0.000001 || Math.abs(resultValue) > 1000000000) {
    return resultValue.toExponential(6)
  }

  return resultValue.toPrecision(10).replace(/\.?0+$/, '')
})

function convertTemperature(value: number, from: string, to: string): string {
  let celsius: number

  if (from === 'c') celsius = value
  else if (from === 'f') celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15

  let result: number
  if (to === 'c') result = celsius
  else if (to === 'f') result = celsius * 9 / 5 + 32
  else result = celsius + 273.15

  return result.toPrecision(10).replace(/\.?0+$/, '')
}

function swapUnits() {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}

watch(category, () => {
  const unitList = units[category.value]
  if (unitList && unitList.length >= 2) {
    fromUnit.value = unitList[0].key
    toUnit.value = unitList[1].key
  }
})
</script>
