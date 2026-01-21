# Demo Tests Checklist

本项目要求每个 demo 都有独立测试文件，并覆盖元信息、路由与 API 响应，同时对 `src/app/demo/*` 下的纯函数进行单元测试。

## 目录结构

- `_demos/*` 测试目录：`tests/demos/`
- `src/app/demo/*` 测试目录：`tests/app-demos/`

## 必备测试项（每个 demo）

### `_demos/*`
- `meta.json` 字段校验：`id/slug/title/description/type/ai/prompt/tags/createdAt`
- 内容文件存在性：`index.html` 或 `App.tsx`
- `getDemoBySlug` 可读取内容与 entry

### `src/app/demo/*`
- `meta.json` 字段校验：`id/slug/title/description/type/ai/prompt/tags/createdAt`
- `getAllDemos` 中可见，并包含 `route`
- 页面文件存在（`page.tsx`）
- API 端点响应（根据该 demo 实际路由，至少覆盖 1 条成功路径）

### 纯函数单测（`src/app/demo/*/utils.ts`）
- 为每个导出的纯函数建立对应的单元测试
- 优先覆盖：输入边界、空值、异常分支、返回值结构

## 测试模板生成

运行以下脚本可为新 demo 生成测试模板（不会覆盖已有文件）：

```bash
pnpm test:generate:demo
```

生成规则：
- `_demos/<slug>/meta.json` -> `tests/demos/<slug>.test.ts`
- `src/app/demo/<slug>/meta.json` -> `tests/app-demos/<slug>.test.ts`
- `src/app/demo/<slug>/utils.ts` -> `tests/app-demos/<slug>.utils.test.ts`

## 新增 demo 的 Checklist

- [ ] 添加 `meta.json`
- [ ] 运行 `pnpm test:generate:demo`
- [ ] 补全生成的 API/纯函数测试（去掉 TODO）
- [ ] 运行 `pnpm qa`
