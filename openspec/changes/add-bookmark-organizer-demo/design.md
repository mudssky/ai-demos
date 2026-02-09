## Context
需要在 Next.js demo 中展示书签管理的完整闭环能力，包含导入导出、可达性检测、AI 整理、去重合并、失效清理与报告导出。浏览器侧需要持久化存储，后端需要路由支持检测与抓取。

## Goals / Non-Goals
- Goals:
  - 通过 `src/app/demo/bookmark-organizer` 提供可运行 demo 页面
  - 使用后端路由完成 URL 可达性检测与 favicon/title 抓取
  - 接入 deepseek 模型进行标签分类与批量重命名
  - IndexedDB 为主存储，自动降级到 localStorage
- Non-Goals:
  - 不做多用户登录与服务端数据持久化
  - 不做真实书签同步（如 Chrome Sync）

## Decisions
- Decision: 使用 `app/api` 路由完成检测与抓取，避免浏览器 CORS 限制。
- Decision: 引入开源存储库实现 IndexedDB + localStorage 降级（如 `localforage`）。
- Decision: 使用 ai-sdk 与 deepseek provider，密钥读取自 `.env.local`。
- Decision: 以“按策略归一化后的 URL”作为去重主键，标题作为次要合并依据，保留首次出现的基础字段。
- Decision: 并发设置默认值为 8，最大值为 32。
- Decision: AI 输出包含目录结构（folder path）、标签与重命名建议。
- Decision: Demo 元信息从 `src/app/demo/**/meta.json` 读取并并入列表展示。

## URL 去重策略草案（探索结论）

### 目标
- 采用“漏合并优先于误合并”的保守策略：宁可同页保留多条，也避免把不同页面错误合并。

### 策略配置
- 去重策略可配置，支持以下模式：
  - strict（严格保留）：保留协议、主机、端口、路径、查询参数；仅移除 hash。
  - balanced（平衡，默认）：保留协议、主机、端口、路径和业务查询参数；移除 hash 与常见追踪参数。
  - aggressive（激进）：仅保留协议、主机、路径；移除端口、查询参数与 hash。

### 默认值
- 默认策略为 balanced。

### balanced 规则草案
- 保留：`protocol + hostname + port + pathname`。
- 移除：`hash`。
- 查询参数归一化：
  - 删除常见追踪参数：`utm_*`、`fbclid`、`gclid`、`msclkid`、`igshid`、`mc_cid`、`mc_eid`。
  - 保留其余查询参数（例如 `id`、`q`、`page` 等业务参数）。
  - 对保留参数按 key 排序后重组，减少参数顺序导致的重复。

### 合并规则草案
- 以“归一化 URL（由所选策略生成）”作为去重主键。
- 同主键记录合并时：
  - `tags` 做并集；
  - `title` 与 `folderPath` 默认保留首条非空值；
  - 对于检测结果（`status`、`responseTimeMs`、`lastCheckedAt`）保留首条值，避免隐式覆盖。

### 风险与权衡
- strict / balanced 可能产生更多“同页多条”残留（漏合并），但可显著降低误合并风险。
- aggressive 去重率最高，但对业务查询参数敏感场景有较高误合并风险，不建议作为默认。

### 后续验证建议
- 需要新增覆盖场景：
  - `?id=1` 与 `?id=2` 在 balanced 下不合并；
  - `?utm_source=a` 与 `?utm_source=b` 在 balanced 下可合并；
  - `:443` 与默认端口、非默认端口的行为符合策略定义；
  - 参数顺序不同但语义相同 URL 在 balanced 下可合并。

## Risks / Trade-offs
- AI 与检测请求可能耗时较长 → 通过并发设置与进度提示缓解。
- 外部 URL 访问可能失败 → 必须返回可解释的状态与错误信息。
- IndexedDB 不可用 → 自动降级 localStorage，但容量受限。

## Migration Plan
- 新增 demo 页面与路由，不影响现有 demo。
- 新增依赖与环境变量后再落地实现。

## Open Questions
- 无
