<template>
  <div class="max-w-xs mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">计算器</h1>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <!-- 显示 -->
      <div class="p-4 text-right bg-gray-50">
        <p class="text-sm text-gray-400 h-5">{{ expression || '&nbsp;' }}</p>
        <p class="text-3xl font-mono font-bold text-gray-900 mt-1">{{ display }}</p>
      </div>
      <!-- 按钮 -->
      <div class="grid grid-cols-4 gap-px bg-gray-200">
        <button
          v-for="btn in buttons"
          :key="btn"
          @click="handleClick(btn)"
          class="py-4 text-lg font-medium transition active:bg-gray-100"
          :class="btnClass(btn)"
        >
          {{ btn }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const display = ref('0')
const expression = ref('')
const waitingForOperand = ref(false)
const operator = ref('')
const prevValue = ref<number | null>(null)

const buttons = [
  'C', '±', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '−',
  '1', '2', '3', '+',
  '0', '.', '⌫', '=',
]

function btnClass(btn: string) {
  if (['÷', '×', '−', '+', '='].includes(btn)) return 'bg-gray-900 text-white hover:bg-gray-800'
  if (['C', '±', '%'].includes(btn)) return 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  return 'bg-white text-gray-900 hover:bg-gray-50'
}

function handleClick(btn: string) {
  if (btn >= '0' && btn <= '9') inputDigit(btn)
  else if (btn === '.') inputDot()
  else if (btn === 'C') clear()
  else if (btn === '±') toggleSign()
  else if (btn === '%') percent()
  else if (btn === '⌫') backspace()
  else if (btn === '=') calculate()
  else inputOperator(btn)
}

function inputDigit(d: string) {
  if (waitingForOperand.value) {
    display.value = d
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? d : display.value + d
  }
}

function inputDot() {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
    return
  }
  if (!display.value.includes('.')) display.value += '.'
}

function clear() {
  display.value = '0'
  expression.value = ''
  operator.value = ''
  prevValue.value = null
  waitingForOperand.value = false
}

function toggleSign() {
  const v = parseFloat(display.value)
  display.value = String(v * -1)
}

function percent() {
  display.value = String(parseFloat(display.value) / 100)
}

function backspace() {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

function inputOperator(op: string) {
  const current = parseFloat(display.value)
  if (prevValue.value !== null && !waitingForOperand.value) {
    const result = compute(prevValue.value, current, operator.value)
    display.value = String(result)
    prevValue.value = result
  } else {
    prevValue.value = current
  }
  expression.value = `${prevValue.value} ${op}`
  operator.value = op
  waitingForOperand.value = true
}

function calculate() {
  if (prevValue.value === null || !operator.value) return
  const current = parseFloat(display.value)
  expression.value = `${prevValue.value} ${operator.value} ${current} =`
  const result = compute(prevValue.value, current, operator.value)
  display.value = String(result)
  prevValue.value = null
  operator.value = ''
  waitingForOperand.value = true
}

function compute(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 0
    default: return b
  }
}
</script>
