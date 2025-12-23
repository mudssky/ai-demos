# 20_coding_standards.md

## 🛡️ Coding Standards (Quality & Maintainability)

> 代码质量、架构原则与测试规范。

### 1. SOLID Principles
- **SRP (Single Responsibility)**：每个文件、函数只做一件事。
- **Complexity Limits**：
  - 文件 > 200 行 → **拆分**。
  - 函数 > 50 行 → **拆分**。
  - 嵌套层级 > 3 → **重构 (Early Return)**。

### 2. Error Handling
- ❌ **No Empty Catch**：严禁使用空的 `try/catch` 块。
- ✅ **Contextual Errors**：错误信息必须包含上下文（"Why it failed", not just "It failed"）。
- ✅ **Promise Rejection**：所有 Promise 必须处理异常情况。

### 3. Naming Conventions (General)
- **Variables/Functions**: `camelCase` (e.g., `fetchUserData`).
- **Booleans**: 必须使用 `is`, `has`, `should` 前缀 (e.g., `isValid`, `hasPermission`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Meaningful Names**: ❌ 禁止 `data`, `item`, `val`, `temp` 等无意义命名。必须全拼。

### 4. Documentation & Comments
- **DocStrings**: 所有导出的函数、类、接口必须包含 JSDoc/TSDoc (`@param`, `@returns`, `@throws`)。
- **"Why" over "What"**: 注释必须解释代码的**意图**和**业务逻辑**，而不是翻译语法。
- **TODOs**: 技术债务必须标记 `// TODO(User): [描述]`。

### 5. Testing & Verification
- **Test Driven**: 鼓励先写测试（或同时编写测试）。
- **Coverage**: 核心逻辑必须有单元测试覆盖。
- **Smoke Testing**: UI 组件修改后，必须确保应用能正常构建和启动。

### 6. Anti-Patterns (Universal)
- ❌ **No `any`**: 严禁使用 TypeScript 的 `any` 类型。必须定义明确的 Interface 或 Type。
- ❌ **No `console.log`**: 生产代码中严禁遗留调试日志。
- ❌ **No Magic Numbers**: 必须提取为常量。
