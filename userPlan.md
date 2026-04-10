1. 计算器缺少历史记录
2. 顶部没有返回按钮，无法返回上一页
3. 移动端有toolbar可以跳转不同工具，但是PC端不行，PC端至少要有返回按钮
4. 接口报错
https://mini-tool-box-for-ai.vercel.app/api/habits
{
  "code": 500,
  "data": null,
  "message": "Could not find the table 'public.habits' in the schema cache",
  "traceId": "t-1775826224115-nqfu"
}
https://mini-tool-box-for-ai.vercel.app/api/pomodoros
{
  "code": 500,
  "data": null,
  "message": "Could not find the table 'public.pomodoros' in the schema cache",
  "traceId": "t-1775826194916-owvd"
}
其他接口也有报错的，好好检查下