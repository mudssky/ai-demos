# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 **Next.js 16** (App Router) + **React 19** 的 AI 演示作品展示平台，支持中英双语，用于展示不同 AI 模型和代码生成工具创建的前端代码示例。

### 核心特性

- **文件式演示系统**：所有演示存储在 `_demos/` 目录中，每个演示包含 `meta.json` 元数据和源码文件
- **双语支持**：使用 `next-intl` 实现完整的中英文国际化
- **实时预览**：React 演示通过 Sandpack 提供在线预览
- **静态导出**：生成纯静态站点，无需服务器
- **搜索索引**：构建时预生成搜索索引 (`public/search-index.json`) 支持客户端搜索

---

## 开发命令

```bash
# 开发
pnpm dev                 # 启动开发服务器 (http://localhost:3000)

# 构建
pnpm build              # 生产构建（自动运行 prebuild: tsx scripts/build-index.ts）
pnpm start              # 运行生产服务器

# 代码质量
pnpm lint               # Biome 检查
pnpm format             # Biome 格式化
pnpm biome:fixAll       # 一键修复 Lint + Format
pnpm biome:ci           # CI 环境检查（仅报告错误，不写入）
pnpm biome:check        # 检查代码风格

# 类型检查
pnpm typecheck          # 完整类型检查 (tsc --noEmit)
pnpm typecheck:fast     # 快速类型检查 (tsgo --noEmit)

# 测试
pnpm test               # 运行单元测试
pnpm test:watch         # 监听模式

# 综合质量检查
pnpm qa                 # 快速 QA（tsgo + biome:fixAll + test）
pnpm qa:slow            # 完整 QA（tsc + biome:fixAll + test）
```

**提交前务必运行** `pnpm qa` 或 `pnpm qa:slow` 确保代码质量。

---

## 技术栈与配置

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.1.1 (App Router), React 19.2.3 |
| 样式 | Tailwind CSS v4 (`@import "tailwindcss"`) |
| UI 组件 | shadcn/ui (Radix UI + Tailwind) |
| 国际化 | next-intl 4.5.6 |
| 预览 | @codesandbox/sandpack-react 2.20.0 |
| 校验 | Zod 4.1.13 |
| 测试 | Vitest 4.0.8, @vitest/coverage-v8 |
| 代码质量 | Biome 2.3.10 (替代 ESLint/Prettier) |
| 类型检查 | TypeScript 5+ (strict mode) |
| 包管理器 | PNPM 10.26.1 |
| Git Hooks | Husky 9.1.7 + lint-staged |

### 关键配置文件

- `next.config.ts`：React Compiler 启用，静态导出模式
- `biome.json`：代码风格规则（2 空格缩进，Next.js/React 规则）
- `tsconfig.json`：路径别名 `@/*` → `./src/*`
- `vitest.config.ts`：覆盖率阈值 (80% lines/functions/statements, 70% branches)
- `components.json`：shadcn/ui 配置

---

## 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由段
│   │   ├── demo/[slug]/page.tsx  # 单个演示详情页
│   │   ├── layout.tsx            # 语言布局（导航、头部）
│   │   └── page.tsx              # 演示列表页（带搜索/筛选）
│   ├── globals.css               # 全局样式 (Tailwind v4)
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 根重定向 → /zh-CN
├── components/
│   ├── ui/                       # shadcn/ui 通用组件
│   ├── DemoCard.tsx              # 演示卡片组件
│   └── ReactPreview.tsx          # Sandpack 预览组件
├── lib/
│   ├── demos.ts                  # 演示系统核心逻辑
│   ├── types.ts                  # TypeScript 类型定义
│   └── utils.ts                  # 工具函数 (cn 等)
└── messages/                     # i18n 翻译文件
    ├── en-US.json
    └── zh-CN.json

_demos/                           # 演示源文件（不在 src 中）
└── [demo-name]/
    ├── meta.json                 # 演示元数据（必须）
    ├── index.html                # HTML 演示（二选一）
    └── App.tsx                   # React 演示（二选一）

scripts/
└── build-index.ts                # 构建搜索索引（prebuild 自动执行）

public/
└── search-index.json             # 预生成的搜索索引
```

---

## 演示系统架构

### 演示元数据 (`meta.json`)

```json
{
  "id": "unique-id",
  "slug": "demo-slug",
  "title": { "en": "English Title", "zh": "中文标题" },
  "description": { "en": "...", "zh": "..." },
  "type": "react" | "html",
  "ai": {
    "model": "gpt-4o" | "gpt-4-turbo" | "claude-3-5-sonnet" | "gemini-pro" | "deepseek-v2",
    "agent": "cursor" | "vscode" | "v0" | "bolt" | "windsurf" | "chatgpt-web"
  },
  "prompt": {
    "main": "主提示词",
    "system": "系统提示（可选）",
    "iteration": "迭代提示（可选）"
  },
  "tags": ["css", "animation"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 核心函数 (src/lib/demos.ts)

| 函数 | 用途 |
|------|------|
| `getDemoBySlug(slug, locale)` | 根据 slug 获取单个演示（含代码） |
| `getAllDemos(options)` | 获取所有演示（可选择性加载内容） |
| `filterDemos(list, criteria)` | 客户端筛选（model/agent/tags/query/type） |
| `buildSearchIndex(list)` | 构建搜索索引 |

### 演示类型

- **HTML 演示**：`index.html` → 通过 iframe 预览
- **React 演示**：`App.tsx` → 通过 Sandpack 预览（必须 `export default function App()`）

---

## 国际化 (next-intl)

### 路由结构

```
/ → 重定向至 /zh-CN
/zh-CN → 默认中文首页
/en-US → 英文首页
/[locale]/demo/[slug] → 演示详情页
```

### 默认语言：`zh-CN`

配置位置：`src/i18n/routing.ts`

### 服务器组件翻译

```tsx
import { getTranslations } from "next-intl/server";

const t = await getTranslations({ locale, namespace: "Home" });
<t("title") />
```

### 客户端组件翻译

```tsx
"use client";
import { useTranslations } from "next-intl";

const t = useTranslations("Home");
<t("title") />
```

### 导航跳转

使用 `src/i18n/routing.ts` 导出的导航 API 以保持 locale：

```tsx
import { Link, useRouter, redirect } from "@/i18n/routing";
```

---

## 代码规范要点

### 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | `PascalCase.tsx` | `UserProfile.tsx` |
| 路由 | `kebab-case` | `my-account/page.tsx` |
| Hooks | `camelCase.ts` | `useAuth.ts` |
| 变量/函数 | `camelCase` | `fetchUserData` |
| 布尔值 | `is/has/should` 前缀 | `isValid`, `hasPermission` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |

### 反模式（严禁）

- ❌ 使用 `any` 类型（必须明确定义类型）
- ❌ 空的 `try/catch` 块（必须处理错误）
- ❌ 生产代码中的 `console.log`
- ❌ 无意义的命名 (`data`, `item`, `val`, `temp`)
- ❌ Magic Numbers（必须提取为常量）
- ❌ 文件超过 200 行、函数超过 50 行（需拆分）
- ❌ 嵌套层级超过 3（使用 Early Return）

### Sandpack 预览规范

```tsx
"use client";  // 必须标记
import { Sandpack } from "@codesandbox/sandpack-react";

<Sandpack
  template="react"
  files={{
    "/App.tsx": code,  // 必须注入 /App.tsx
  }}
/>
```

预览组件必须懒加载（动态导入）以优化性能。

---

## 构建与部署

### 静态导出模式

项目使用 `output: "export"` 生成纯静态站点：

- 无需 Node.js 服务器
- 适合部署到任何静态托管
- 图片自动禁用优化 (`unoptimized: true`)

### 构建流程

1. `prebuild`: 运行 `tsx scripts/build-index.ts` 生成搜索索引
2. `next build`: 构建生产版本
3. 输出目录: `out/`

---

## 测试规范

- 使用 Vitest (位于 `tests/` 或 `*.test.ts`)
- 核心逻辑必须有单元测试
- 覆盖率阈值：80% (lines/functions/statements), 70% (branches)
- UI 组件修改后必须进行冒烟测试（确保构建和启动正常）

---

## 参考文档

- 详细的编码规范和项目规则位于 `.trae/rules/` 目录
- README.md 包含快速开始和基础技术栈说明
- 本项目默认语言为中文，代码注释和提交信息应使用中文
