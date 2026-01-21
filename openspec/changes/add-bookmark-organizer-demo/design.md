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
- Decision: 以 URL 作为主键去重，标题作为次要合并依据，保留首次出现的基础字段。

## Risks / Trade-offs
- AI 与检测请求可能耗时较长 → 通过并发设置与进度提示缓解。
- 外部 URL 访问可能失败 → 必须返回可解释的状态与错误信息。
- IndexedDB 不可用 → 自动降级 localStorage，但容量受限。

## Migration Plan
- 新增 demo 页面与路由，不影响现有 demo。
- 新增依赖与环境变量后再落地实现。

## Open Questions
- 并发默认值与最大值是否有明确限制？
- AI 输出的分类层级是否需要固定格式？
