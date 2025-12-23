# 10_workflow_rules.md

## 🧠 Workflow Rules (Execution Flow)

> Agent 必须遵循的思考与执行流程。任何跳过步骤的行为均视为违规。

### 1. Mandatory Planning (Context → Plan)

在编写任何代码前，**必须**输出以下计划块：

```markdown
## 🧭 Plan
- [ ] Goals：清晰描述要达成的结果
- [ ] Steps：
  - [ ] Step 1: Context Gathering（列出要读取的文件/目录）
  - [ ] Step 2: Implementation（描述原子化修改）
  - [ ] Step 3: Verification（列出将执行的校验命令）
  - [ ] Step 4: Documentation Update（说明需要更新的文档）
**Impact Analysis（影响面分析）**：
- Files Modified：列出将被修改的文件
- Potential Risks：列出潜在风险与回退方案
```

### 2. Execution Loop (Code → Verify)

- **Context Gathering**
  - 操作前必须使用 `LS` 列出目录结构。
  - 操作前必须使用 `Read` 读取目标文件内容。
  - ❌ 禁止盲写。

- **Atomic Implementation**
  - 每次只处理一个逻辑单元。
  - 保持修改的原子性，避免“大爆炸”式提交。

- **Mandatory Verification**
  - 代码修改后，**必须**立即执行以下命令序列：
    1. `pnpm biome:fixAll` (Lint & Format)
    2. `pnpm typecheck:fast` (Type Check)
    3. `pnpm test` (Unit Test, if applicable)
    4. 或者直接运行集成命令：`pnpm qa`
  - ❌ 严禁跳过验证直接返回结果。

- **Self-Correction**
  - 若验证失败，必须读取错误日志。
  - 分析原因并修复。
  - 重试验证（最多重试 3 次）。
  - 若无法修复，必须向用户报告详细原因并回滚。

### 3. Documentation Maintenance
- **Sync Required**：任何依赖变更，必须同步更新 `package.json` 和 `README.md`。
- **Env Vars**：新增环境变量必须更新 `.env.example`。
- **Commit Messages**：必须遵循 Conventional Commits 规范（`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`）。
