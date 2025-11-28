# AI Demos（Next.js 16 + React 19）

本项目基于 Next.js 16（App Router）与 React 19，已集成 Tailwind v4、Vitest、Biome，并新增 Zod 与 shadcn/ui 技术栈。

## 快速开始

- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`，访问 `http://localhost:3000`
- 质量校验：`pnpm qa`（类型检查 + 格式修复 + 测试）

## 技术栈

- 应用框架：`next@16.0.5`
- 运行时：`react@19.2.0`、`react-dom@19.2.0`
- 样式：`tailwindcss@^4`、`@tailwindcss/postcss@^4`
- 代码质量：`@biomejs/biome@2.3.8`
- 测试：`vitest@^4.0.8`、覆盖率：`@vitest/coverage-v8`
- UI 组件：`shadcn/ui`（通过生成组件，已配置 `components.json`）
  - 依赖：`class-variance-authority`、`tailwind-merge`、`@radix-ui/react-slot`、`lucide-react`
- 校验与类型安全：`zod@^4`

## 已集成内容

- 基础 UI 组件：`Button`、`Input`、`Label`（路径：`src/components/ui/*`）
- Zod 表单校验示例：`/demo/zod-form`
  - 文件：`src/app/demo/zod-form/page.tsx`
  - 功能：姓名与邮箱校验、错误提示、成功信息展示
- 单元测试：`tests/zod.test.ts`

## 目录结构

```
src/
  app/
    globals.css
    page.tsx
    demo/
      zod-form/
        page.tsx
  components/
    ui/
      button.tsx
      input.tsx
      label.tsx
  lib/
    utils.ts
tests/
  zod.test.ts
```

## 开发命令

- `pnpm dev` 启动开发服务器
- `pnpm build` 构建生产包
- `pnpm start` 运行生产服务
- `pnpm qa` 一体化质量检查（类型 + 格式 + 测试）
- `pnpm test` 运行单元测试

## 注意事项

- Tailwind v4 已在 `src/app/globals.css` 通过 `@import "tailwindcss"` 引入，主题变量通过 `@theme inline` 与 CSS 变量维护。
- shadcn/ui 组件生成配置位于 `components.json`，组件放置于 `src/components/ui`。
- 避免在生产代码中使用 `console.log`，统一使用类型安全与早返回策略。

## 国际化（next-intl）

- 路由结构：`src/app/[locale]/`，支持 `en-US` 与 `zh-CN` 两个语言前缀。
- 消息文件：`messages/{locale}.json`，如：`messages/en-US.json`、`messages/zh-CN.json`。
- Provider 集成：`src/app/[locale]/layout.tsx` 动态加载对应 `messages` 并包裹 `NextIntlClientProvider`。
- 中间件：`src/middleware.ts` 使用 `next-intl` 中间件（配置位于 `src/i18n/routing.ts`）强制语言前缀与默认语言 `en-US`。
- 根路由：`src/app/page.tsx` 重定向至 `/en-US`，统一入口到带语言前缀的页面。
- 服务器组件翻译：

  ```ts
  import {getTranslations} from "next-intl/server";
  const t = await getTranslations({locale: "en", namespace: "Home"});
  t("title");
  ```

- 客户端组件翻译：

  ```tsx
  "use client";
  import {useTranslations} from "next-intl";
  const t = useTranslations("Home");
  t("title");
  ```
