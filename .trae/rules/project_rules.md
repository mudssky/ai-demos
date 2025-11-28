# 项目规则与 Agent 行为宪法

## 🚨 最高指令（不可违背）

- No Laziness（零容忍懒惰）
  - 严禁在代码块中使用 `// ... existing code`、`// ... implement logic here` 等占位符。
  - 必须输出被修改文件或代码块的完整内容，禁止局部截断输出。
  - 仅当使用具备上下文保障的专用检索替换工具时，才允许局部替换。
- No Hallucination（零容忍幻觉）
  - 严禁引入或使用 `package.json` 中不存在的库或命令。
  - 如需新增依赖，必须先征求用户许可，并使用 `pnpm add <pkg>` 安装后再使用。
- Language（语言）
  - 沟通、代码注释与解释统一使用中文（除非用户另行指定）。
  - 语气：严厉、精确、工程化，无情绪化表达。

## 🧠 思考与规划（Context → Plan → Code → Verify）

- 在编写任何代码前，必须在对话中输出以下计划块：

```markdown
<plan>
- [ ] Step 1: Context Gathering（列出要读取的文件/目录）
- [ ] Step 2: Implementation（描述原子化修改）
- [ ] Step 3: Verification（列出将执行的校验命令）
- [ ] Step 4: Documentation Update（说明需要更新的文档）
</plan>

**Impact Analysis（影响面分析）**：
- Files Modified：列出将被修改的文件
- Potential Risks：列出潜在风险与回退方案
```

## 🛠 技术栈与编码规范

- Core Stack（核心栈）
  - Framework：Next.js 16（App Router） `next@16.0.5`
  - Language：TypeScript `^5`
  - Runtime：React `19.2.0`
  - Styling：Tailwind CSS `^4`（Utility-first），PostCSS `@tailwindcss/postcss`
  - Lint/Format：Biome `@biomejs/biome@2.3.8`
  - Testing：Vitest `^4.0.8`，Coverage `@vitest/coverage-v8`
  - UI: shadcn

- Package Manager（包管理器）
  - `pnpm`（已存在 `pnpm-lock.yaml`）

- Script Commands（脚本命令，来自 `package.json`）

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check",
    "format": "biome format --write",
    "prepare": "husky",
    "typecheck": "tsc --noEmit",
    "typecheck:fast": "tsgo --noEmit",
    "biome:fixAll": "biome check --write .",
    "biome:check": "biome check .",
    "biome:ci": "biome ci .",
    "qa": "pnpm typecheck:fast && pnpm biome:fixAll && pnpm test",
    "qa:slow": "pnpm typecheck && pnpm biome:fixAll && pnpm test",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- Naming Conventions（命名规范）
  - 变量/函数：`camelCase`（如 `fetchUserData`）
  - 组件文件：`PascalCase`（如 `UserProfile.tsx`）
  - 路由/文件夹：`kebab-case` 或 `[slug]`（如 `my-account`、`[locale]`）
  - 常量：`UPPER_SNAKE_CASE`（如 `MAX_RETRY_COUNT`）

- Preferred Patterns（推荐模式）
  - 函数组件：`const Component = () => {}`
  - 复用逻辑用自定义 Hooks：`useSomething`
  - Early Returns：优先处理边界减少嵌套
  - Type Safety：严格类型，使用 `type`/`interface`，避免 `any`
  - Tailwind：按工具类优先，避免内联样式；允许使用合并工具（如 `cn`）
  - Next.js：在可行处使用 Server Components；事件逻辑放入事件处理器

- Anti-Patterns（禁止模式）
  - ❌ 禁止 `any`（必须显式类型）
  - ❌ 生产代码中禁止 `console.log`
  - ❌ 禁止 Class 组件（错误边界除外）
  - ❌ 禁止滥用 `useEffect`（优先 Server Components 或事件）
  - ❌ 禁止 jQuery 或直接 DOM 操作（使用 Ref）

## ⚡ 严格执行流（Development Workflow）

- Step 1: Context Gathering（收集上下文）
  - 必须先列目录（如在 IDE 中运行目录列表）并读取相关文件。
  - 严禁盲写或猜测文件路径/内容。

- Step 2: Coding（编码）
  - 以原子化方式进行改动，遵循命名规范与推荐模式。

- Step 3: Self-Correction（自校验，必选）
  - 每次改动后必须执行校验：
    - Lint & Format：`pnpm biome:fixAll`
    - Type Check（优先快检）：`pnpm typecheck:fast`
    - 若快检不可用或失败，则回退：`pnpm typecheck`
  - 若出现错误：读取错误→修复→重试（最多 3 次）。
  - 仅当所有校验通过，方可视为任务完成。

- Step 4: Documentation（文档）
  - 依赖变更必须同步更新 `package.json` 与 `README.md`。
  - 环境变量变更必须更新 `.env.example`。

## 📝 文档与维护

- 依赖/脚本变更：更新 `package.json` 与 `README.md`，并在变更记录中注明。
- 环境变量：统一管理于 `.env.example`，保持最小必要集。
- 提交规范：遵循 Conventional Commits（`feat:`、`fix:`、`docs:`、`refactor:`、`chore:`）。

## 📂 项目结构指南（ASCII 树）

```text
d:\coding\Projects\AI\ai-demos\
├── src/
│   └── app/                 # Next.js App Router 根目录
│       ├── globals.css      # Tailwind v4 样式入口
│       ├── layout.tsx       # 应用级布局（Server Component 优先）
│       └── page.tsx         # 首页入口
├── public/                  # 静态资源（SVG 等）
├── biome.json               # Biome 配置（Lint/Format）
├── next.config.ts           # Next.js 配置
├── postcss.config.mjs       # PostCSS 配置
├── tsconfig.json            # TypeScript 配置
├── vitest.config.ts         # Vitest 测试配置
├── .husky/                  # Husky Git Hooks（如 pre-commit）
├── .trae/                   # Trae/Agent 规则文件
│   └── rules/
│       └── project_rules.md # 本文件（行为宪法）
├── prd/                     # 产品文档与需求
├── README.md                # 项目说明文档
├── LICENSE                  # 许可证
├── package.json             # 包与脚本定义
└── pnpm-lock.yaml           # pnpm 锁文件
```

## � 严格度等级

- Strictness Level：High（任何 Lint 警告视为错误）

## ⚔️ 执行要求摘要

- 必须遵循 Context → Plan → Code → Verify 闭环。
- 禁止懒惰与幻觉；任何偏离将被视为错误行为。
- 修改后立即运行：`pnpm biome:fixAll`、`pnpm typecheck:fast`（失败则 `pnpm typecheck`）、必要时 `pnpm test`，可以执行pnpm qa,一次性包含3个命令
- 仅输出完整内容；所有说明以中文呈现；提交信息遵循约定式规范。
