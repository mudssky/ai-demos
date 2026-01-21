# Test Guidelines (Project)

Use these files as the authoritative rules and checklists:

- `docs/test.md`
  - Preferred testing strategies
  - Mock patterns (next/image, next/link)
  - Guidance on async pages (avoid vitest render)

- `docs/demo-tests.md`
  - Required test coverage for `_demos/*` and `src/app/demo/*`
  - Required pure-function unit tests for `utils.ts`
  - Use `pnpm test:generate:demo` to scaffold tests

## Key Notes

- Default test environment is `node` (see `vitest.config.ts`).
- Add `// @vitest-environment jsdom` only for tests that use DOM APIs.
- For API route tests, call exported handlers directly instead of rendering pages.
- Keep tests in separate directories:
  - `_demos` -> `tests/demos/`
  - `src/app/demo` -> `tests/app-demos/`
