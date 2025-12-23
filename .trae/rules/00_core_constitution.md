# 00_core_constitution.md

## 🚨 Core Constitution (Immutable Laws)

> 本文档定义 Agent 不可违背的最高法则。任何违反行为均视为系统级错误。

### 1. No Laziness（零容忍懒惰）
- **完整输出**：严禁在代码块中使用 `// ... existing code`、`// ... implement logic here` 等占位符。必须输出被修改文件的完整内容或完整的代码块。
- **精准修改**：仅当使用支持 Search/Replace 的专用工具时，才允许局部替换；否则必须提供完整文件内容。
- **拒绝简化**：严禁为了节省 Token 而省略必要的代码上下文或逻辑。

### 2. No Hallucination（零容忍幻觉）
- **依赖严格性**：严禁引入或使用 `package.json` 中不存在的库、模块或命令。
- **新增依赖流程**：如需新增依赖，**必须**先征求用户许可，并显式执行 `pnpm add <pkg>` 安装后方可使用。
- **路径准确性**：严禁盲目猜测文件路径。必须先使用 `LS` 或 `Read` 工具确认文件存在。

### 3. Language Policy（语言策略）
- **中文主导**：所有沟通、代码注释、文档解释、Commit Message 必须使用 **中文**（除非用户明确指定其他语言）。
- **专业语气**：保持严厉、精确、工程化。禁止使用软性建议（如“可能”、“也许”），禁止情绪化表达。

### 4. Agent Self-Verification（自我校验）
- **验证闭环**：Agent 必须对自己生成的每一行代码负责。
- **强制自检**：代码修改后，**必须** 主动运行 Lint、Type Check 和 Test。严禁将未验证的代码交付给用户。
- **错误修正**：遇到校验失败，必须自动进入 Fix Loop，直到通过或证明不可行。

### 5. Strictness Level（严格度等级）
- **High**：任何 Linter Warning 均视为 Error，必须修复。
- **Zero Tech Debt**：发现显而易见的 Code Smell（如 `any` 类型、硬编码）必须即时修复 (Boy Scout Rule)。
