# Change: Add bookmark organizer demo

## Why
需要一个可运行的 Next.js demo，展示书签导入/导出、可达性检测与 AI 整理等完整能力，并可直接复用项目依赖与后端路由。

## What Changes
- 新增 `src/app/demo/bookmark-organizer` 页面与 UI 交互
- 新增后端路由用于可达性检测与 favicon/title 抓取
- 新增 AI 整理能力，调用 deepseek 模型（ai-sdk）
- 增加导入/导出（Chrome HTML/JSON）、去重合并、失效链接分组与批量清理
- 增加报告导出（CSV/JSON，包含状态码/响应时间）
- 新增本地持久化（IndexedDB，降级 localStorage）
- 增加并发配置弹窗

## Impact
- Affected specs: `specs/bookmark-organizer-demo/spec.md`
- Affected code: `src/app/demo/bookmark-organizer/**`, `src/app/api/**`, `src/lib/**`, `package.json`
