# 错误复盘记录

本文档记录开发过程中犯的严重错误和教训，避免后续再犯同样错误。

---

## 错误 #1：Vue 模板语法错误导致构建失败

**日期**：2026-04-10

**错误代码**：
```html
<h1>倒计时</纪念日</h1>
```

**错误原因**：
- `</纪念日` 被解析为 HTML 结束标签
- Vue 模板解析器无法正确解析

**解决方案**：
```html
<h1>倒计时/纪念日</h1>
```

**教训**：
- Vue 模板文本中避免直接使用 `<` `>` `/` 字符
- 使用中文符号或转义字符替代

---

## 错误 #2：logger.ts 构建错误

**日期**：2026-04-10

**错误原因**：
- 代码过于复杂，存在类型推断问题
- ESM 模块兼容性问题

**解决方案**：
- 简化代码，移除复杂的接口定义
- 保持代码简洁，避免过度设计

**教训**：
- 服务端工具代码保持简单
- 避免过度抽象和复杂类型

---

## 错误 #3：多次部署失败

**日期**：2026-04-10

**错误原因**：
- 没有在本地运行 `npm run build` 验证
- 直接推送到 Vercel 依赖云端构建
- 一次性提交大量代码，错误难以定位

**解决方案**：
- 提交前必须运行 `npm run build`
- 分功能模块提交，便于定位问题

**教训**：
- 本地验证优先，云端部署其次
- 增量开发，增量提交

---

## 错误 #4：导入路径错误导致构建失败

**日期**：2026-04-11

**错误信息**：
```
RollupError: Could not resolve "./validators" from "server/api/countdowns/index.post.ts"
```

**错误代码**：
```typescript
import { countdownSchema } from './validators'
```

**错误原因**：
- `server/api/countdowns/` 目录下没有 `validators.ts` 文件
- `countdownSchema` 实际定义在 `server/utils/validators.ts` 中
- 导入路径错误

**解决方案**：
```typescript
import { countdownSchema } from '~/server/utils/validators'
```

**教训**：
- 新增 API 文件时，检查导入路径是否正确
- validators 统一放在 `server/utils/validators.ts`
- 不要在 API 目录下创建单独的 validators 文件

---

## 复盘模板

```markdown
## 错误 #N：[错误标题]

**日期**：YYYY-MM-DD

**错误代码**：
[错误代码片段]

**错误原因**：
[分析原因]

**解决方案**：
[修复方法]

**教训**：
[总结经验]
```

---

## 使用方法

1. 犯严重错误后，立即复盘
2. 按模板记录错误详情
3. 提交到 Git 仓库
4. 新会话开始时阅读本文档
