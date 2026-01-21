---
name: demo-tests
description: Create or update tests for this project's demos. Use when adding tests for `_demos/*` or `src/app/demo/*`, including meta.json validation, route availability, API route responses, and unit tests for demo utils. Also use when running or fixing demo test coverage with `pnpm test:generate:demo` and `pnpm qa`.
---

# Demo Tests Skill

## Workflow

1. Identify demo type
   - File demos live in `_demos/<slug>/` with `meta.json` and `index.html` or `App.tsx`.
   - App demos live in `src/app/demo/<slug>/` with `meta.json` and `page.tsx`.

2. Generate test templates
   - Run: `pnpm test:generate:demo`
   - This creates missing tests under:
     - `tests/demos/<slug>.test.ts`
     - `tests/app-demos/<slug>.test.ts`
     - `tests/app-demos/<slug>.utils.test.ts` (if `utils.ts` exists)

3. Fill in required assertions
   - `_demos`:
     - Validate `meta.json` required fields
     - Validate content file exists and contains expected marker
     - Validate `getDemoBySlug` reads entry + code
   - `src/app/demo`:
     - Validate `meta.json` required fields
     - Validate `getAllDemos` includes `route`
     - Validate `page.tsx` exists (string match for title or key text)
     - Validate API route handlers return expected response for a success path
   - `utils.ts`:
     - For every exported pure function, add unit tests
     - Cover edge cases: empty input, invalid input, fallback branches
     - Use `// @vitest-environment jsdom` when DOM APIs are needed

4. API route tests
   - Import handlers directly, e.g. `import { POST } from "@/app/api/.../route"`
   - Mock global `fetch` where outbound requests are performed
   - For AI endpoints, mock provider or `generateObject` to avoid network

5. Run validation
   - Run: `pnpm qa`
   - Fix lint/type/test failures before finalizing

## References

- Read `references/test-guidelines.md` for project-specific testing rules and templates.
