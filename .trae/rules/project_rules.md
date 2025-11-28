# Project Rules & Agent Behavior Constitution

## 🚨 Critical Instructions (Highest Priority)

1. **NO LAZINESS**:
    * **NEVER** use `// ... existing code`, `// ... implement logic here`, or similar placeholders.
    * You MUST output the **FULL** content of the file or the **COMPLETE** code block being modified.
    * Partial updates are strictly forbidden unless using a specialized `SearchReplace` tool that guarantees context.

2. **NO HALLUCINATION**:
    * **STRICTLY FORBIDDEN** to import or use libraries not listed in `package.json`.
    * If a new library is needed, you MUST explicitly ask the user for permission to install it using `pnpm add`.

3. **LANGUAGE & TONE**:
    * All communication, comments, and explanations MUST be in **Chinese (中文)** (unless the user asks otherwise).
    * Tone: Professional, Concise, Engineering-focused.

## 🧠 Chain of Thought & Planning

Before writing any code, you MUST output a plan block:

```markdown
<plan>
- [ ] Step 1: Context Gathering (List files to read)
- [ ] Step 2: Implementation (Atomic changes)
- [ ] Step 3: Verification (Commands to run)
- [ ] Step 4: Documentation Update
</plan>

**Impact Analysis**:
- Files Modified: [List files]
- Potential Risks: [List risks]
```

## 🛠 Tech Stack & Coding Standards

### Core Stack

* **Framework**: Next.js 16 (App Router)

* **Language**: TypeScript ^5
* **Styling**: Tailwind CSS v4 (Utility-first)
* **Linting/Formatting**: Biome (`@biomejs/biome`)
* **Testing**: Vitest

### Naming Conventions

* **Variables/Functions**: `camelCase` (e.g., `fetchUserData`)

* **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
* **Folders (App Router)**: `kebab-case` or `[slug]` (e.g., `my-account`, `[locale]`)
* **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

### Preferred Patterns

* **Functional Components**: Use `const Component = () => {}`.

* **Hooks**: Custom hooks for logic reuse (`useMyHook`).
* **Early Returns**: Reduce nesting by handling edge cases first.
* **Type Safety**: Strict TypeScript. Use interfaces/types. Avoid `any`.
* **Tailwind**: Use `clsx` / `tailwind-merge` (or `cn` utility) for conditional classes.

### Anti-Patterns (Strictly Prohibited)

* ❌ **No `any`**: Explicitly define types.

* ❌ **No `console.log`**: In production code.
* ❌ **No Class Components**: Unless absolutely necessary for Error Boundaries.
* ❌ **No `useEffect` abuse**: Prefer Server Components or Event Handlers where possible.
* ❌ **No jQuery or Direct DOM manipulation**: Use Refs.

## ⚡ Development Workflow (Strict Execution Loop)

You MUST follow this loop for every coding task:

### Step 1: Context Gathering

* Run `ls` to explore directories.

* Read related files using `Read`.
* **DO NOT GUESS** file paths or contents.

### Step 2: Coding

* Implement changes atomically.

* Follow the **Naming Conventions** and **Preferred Patterns**.

### Step 3: Self-Correction (MANDATORY)

* After ANY code change, you MUST run the verification commands:
    1. **Lint & Format**: `pnpm biome:fixAll`
    2. **Type Check**: `pnpm typecheck:fast`

* **If errors occur**:
  * Read the error message.
  * Fix the code.
  * Re-run the check (Max 3 retries).
* **Only when checks pass** can you consider the task complete.

### Step 4: Documentation

* If dependencies change -> Update `package.json` & `README.md`.

* If env vars change -> Update `.env.example` (if exists).

## 📂 Project Structure Guide

```text
d:\coding\Projects\AI\ai-demos\
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n routes
│   │   ├── page.tsx        # Home page
│   │   └── demo/           # Demo details
│   └── globals.css         # Tailwind v4 imports
├── components/             # React Components
│   ├── ui/                 # Shared UI components
│   └── ...                 # Feature components
├── lib/                    # Utilities & Logic
│   ├── demos.ts            # Data fetching logic
│   └── types.ts            # TypeScript definitions
├── _demos/                 # Content Source (File System DB)
├── messages/               # i18n strings (en.json, zh.json)
├── public/                 # Static assets
└── package.json
```

## 📝 Commit Message Convention

Follow Conventional Commits:

* `feat: ...` for new features
* `fix: ...` for bug fixes
* `docs: ...` for documentation
* `refactor: ...` for code restructuring
* `chore: ...` for maintenance
