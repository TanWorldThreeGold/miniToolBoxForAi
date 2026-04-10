<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">工具箱</h1>
      <p class="text-gray-500 mt-1">选择一个工具开始使用</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <ToolCard
        v-for="tool in tools"
        :key="tool.to"
        v-bind="tool"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const tools = [
  { to: '/expense', icon: '💰', title: '记账', description: '收支记录与月度统计', bgColor: '#FEF3C7' },
  { to: '/todo', icon: '✅', title: 'TODO', description: '待办事项管理', bgColor: '#DBEAFE' },
  { to: '/diary', icon: '📝', title: '日记', description: '每日记录与心情', bgColor: '#FCE7F3' },
  { to: '/calculator', icon: '🧮', title: '计算器', description: '标准计算器', bgColor: '#E0E7FF' },
  { to: '/pomodoro', icon: '🍅', title: '番茄钟', description: '专注计时与倒计时', bgColor: '#FEE2E2' },
  { to: '/habits', icon: '🎯', title: '习惯打卡', description: '每日习惯追踪', bgColor: '#D1FAE5' },
  { to: '/currency', icon: '💱', title: '汇率换算', description: '实时货币转换', bgColor: '#FEF9C3' },
  { to: '/memo', icon: '🔑', title: '密码 & 备忘', description: '密码生成与备忘录', bgColor: '#F3E8FF' },
]
</script>
