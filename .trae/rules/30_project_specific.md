# 30_project_specific.md

## 📂 Project Specific Rules (The Only Variable Part)

> 本项目特定的技术栈、配置与目录结构。

### 1. Core Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript ^5
- **Styling**: Tailwind CSS v4, PostCSS
- **Validation**: Zod ^4
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- **Lint/Format**: Biome (@biomejs/biome)
- **Testing**: Vitest, @vitest/coverage-v8
- **Preview**: @codesandbox/sandpack-react

### 2. Scripts (Mandatory Usage)
- `pnpm dev`: 启动开发服务器
- `pnpm build`: 构建生产版本
- `pnpm lint`: 检查代码风格
- `pnpm format`: 修复代码格式
- `pnpm typecheck:fast`: 快速类型检查 (tsgo)
- `pnpm typecheck`: 完整类型检查 (tsc)
- `pnpm biome:fixAll`: 一键修复 Lint & Format 错误
- `pnpm test`: 运行单元测试
- `pnpm qa`: **全量质量检查 (Typecheck + Biome + Test)** - 提交前必跑

### 3. Project Structure (ASCII Tree)
```text
src/
├── app/                 # Next.js App Router
│   ├── [locale]/        # i18n 路由
│   ├── globals.css      # 全局样式
│   └── layout.tsx       # Root Layout
├── components/
│   ├── ui/              # shadcn/ui 通用组件
│   └── [Feature]/       # 业务组件
├── lib/
│   ├── utils.ts         # 通用工具 (cn 等)
│   └── [domain]/        # 业务逻辑/类型定义
├── messages/            # i18n 翻译文件
├── public/              # 静态资源
├── tests/               # 单元测试
└── ...config files
```

### 4. Specific Patterns & Guidelines

#### Next.js / React
- **Server Components**: 默认使用 Server Components。需要交互时显式添加 `"use client"`。
- **Hooks**: 逻辑复用必须封装为 Custom Hooks (`useExample`)。
- **Functional Components**: 统一使用 `const Component = () => {}`。

#### Tailwind CSS / UI
- **Utility-First**: 优先使用 Utility Classes。
- **No Inline Styles**: 禁止使用 `style={{ ... }}`。
- **Shadcn/UI**: UI 组件必须遵循 shadcn 规范，置于 `src/components/ui`。
- **CVA**: 复杂组件变体必须使用 `cva` 定义。

#### Sandpack (Live Preview)
- **Usage**: 使用 `@codesandbox/sandpack-react` 进行组件在线预览。
- **Client Only**: 预览组件文件必须包含 `"use client"`。
- **Entry Point**: `files` 属性必须注入 `"/App.tsx"`，且代码必须 `export default function App()`.
- **Performance**: 必须懒加载预览组件。

#### Naming (Files & Folders)
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Routes**: `kebab-case` (e.g., `my-account/page.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useAuth.ts`)
