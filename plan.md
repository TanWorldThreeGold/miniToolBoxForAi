# ToolBox 功能迭代计划

## 当前状态

### 已有功能
- ✅ TODO 管理（优先级、截止日期）
- ✅ 记账（收支记录、分类统计图表、导出CSV）
- ✅ 日记（每日记录+心情）
- ✅ 备忘录（支持加密）
- ✅ 习惯打卡（30天热力图、连续天数、归档）
- ✅ 番茄钟
- ✅ 计算器（含历史记录）
- ✅ 汇率换算
- ✅ 数据导入/导出
- ✅ 主题切换（深色/浅色模式）
- ✅ 日志功能
- ✅ 测试用例
- ✅ 密码生成器
- ✅ 单位换算
- ✅ 二维码生成器
- ✅ 倒计时/纪念日

---

## Phase 2 已完成功能

### 2.1 TODO 增强 ✅
- ✅ 优先级标记（高/中/低）
- ✅ 截止日期设置
- ✅ 过期提醒
- ✅ 按优先级排序

### 2.2 记账增强 ✅
- ✅ 分类统计条形图
- ✅ 导出 CSV
- ✅ 深色模式支持

### 2.5 习惯打卡增强 ✅
- ✅ 连续打卡天数统计
- ✅ 30天打卡热力图
- ✅ 习惯归档（暂停但不删除）

---

## Phase 3 已完成功能
- ✅ 密码生成器 - 生成随机强密码，支持长度、字符类型设置
- ✅ 单位换算 - 长度、重量、温度、面积、体积、速度换算
- ✅ 二维码生成器 - 文本/URL 转二维码，支持下载和复制
- ✅ 倒计时/纪念日 - 设置重要日期倒计时

---

## Phase 2 待实现功能（需要进一步开发）

### 2.3 日记增强
- 富文本编辑器（Markdown 支持）
- 图片上传
- 日记搜索
- 日历视图

### 2.4 番茄钟增强
- 自定义时长设置
- 白噪音背景音乐
- 专注统计报表
- 休息提醒

---

## Phase 4 待实现功能（长期）

### 4.1 PWA 支持
- 可安装为桌面/手机应用
- 离线访问、推送通知

### 4.2 数据同步增强
- 多设备间实时同步
- Supabase Realtime

### 4.3 分享功能
- 分享特定数据给他人（只读链接）

### 4.4 回收站
- 删除的数据保留 30 天可恢复

---

## DDoS 防护分析

### 当前项目能否抗住 DDoS 攻击？

**❌ 不能**。当前项目部署在 Vercel Serverless 上，没有内置 DDoS 防护措施。

### 为什么无法防护？
1. **Vercel 免费版限制**
   - 有限带宽限制（免费版 100GB/月）
   - 无 DDoS 防护功能
   - 无速率限制
2. **Supabase 免费版限制**
   - 连接数限制
   - 无 DDoS 防护功能
3. **项目架构限制**
   - 无缓存层
   - 无 CDN 保护
   - 无 WAF 防护

### 解决方案

| 方案 | 说明 | 成本 |
|------|------|------|
| **Cloudflare** | 免费 DDoS 防护，CDN 加速 | 免费 |
| **Vercel + Cloudflare 集成** | Vercel 可直接配置 Cloudflare | 添加域名配置即可 |
| **Rate Limiting 中间件** | 限制 API 请求频率 | 需要自己实现 |
| **缓存策略** | 添加 Redis 或内存缓存 | 需要额外服务 |
| **监控告警** | 配置监控和及时告警 | 基础设施 |

### 推荐方案：Cloudflare（免费）

1. 在 Cloudflare 添加你的域名
2. 将域名 DNS 指向 Cloudflare
3. 开启 DDoS 防护功能
4. 配置速率限制规则
5. Vercel 会自动使用 Cloudflare 的防护

**Cloudflare 免费版 DDoS 防护能力**：
- 无限制的 DDoS 攻击防护
- CDN 加速
- Web 应用防火墙 (WAF)
- 速率限制
- Bot 防护

---

## 数据库更新说明

部署后需要在 Supabase 执行以下 SQL 更新现有表：

```sql
-- 为 todos 表添加新字段
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES public.todos(id) ON DELETE CASCADE;

-- 为 habits 表添加归档字段
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false NOT NULL;

-- 创建 countdowns 表
CREATE TABLE IF NOT EXISTS public.countdowns (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date date not null,
  created_at timestamptz default now() not null
);

ALTER TABLE public.countdowns enable row level security;
CREATE POLICY "Users manage own countdowns" ON public.countdowns
  FOR ALL USING (auth.uid() = user_id);
```
