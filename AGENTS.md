# AGENTS.md
Guidance for agentic coding assistants working in this repository.

## 1) Repository scope and working directory
- Monorepo root: `Baimir/`
- Main app code: `Baimir/frontend/`
- Most actionable scripts live in: `frontend/package.json`
- Root `package.json` contains dependencies only (no scripts)
- Default to running npm commands from `frontend/`

## 2) Cursor/Copilot rule files
Checked paths:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Current status:
- No Cursor rule files found
- No Copilot instruction file found

If these files are added later, treat them as higher-priority behavior constraints and update this document.

## 3) Stack overview
- React 19 + TypeScript + Vite 7
- Redux Toolkit + RTK Query
- React Router 7
- Tailwind CSS (via `@tailwindcss/vite`)
- MUI (`@mui/material`, `@mui/icons-material`)
- i18next + Tolgee integrations

## 4) Install, run, build, lint commands
Run from `frontend/` unless noted.

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run knip
```

Command intent:
- `npm run dev` - start Vite dev server (`host 0.0.0.0`, `port 5173`)
- `npm run build` - type-check and build (`tsc -b && vite build`)
- `npm run preview` - preview production build
- `npm run lint` - run ESLint across project
- `npm run knip` - detect unused files/exports/deps

## 5) Test commands (including single-test guidance)
Current reality:
- No test runner is configured in `frontend/package.json`
- No `*.test.*` or `*.spec.*` files found
- No working `npm test` command today

Validation commands you should run now:
- `npm run lint`
- `npm run build`

If tests are introduced (recommended: Vitest), use:

```bash
# single test file
npx vitest run src/path/to/file.test.ts

# single test by name
npx vitest run src/path/to/file.test.ts -t "test name"
```

If Playwright or Cypress is added later, document exact single-spec commands here.

## 6) Environment and runtime notes
- Frontend env file exists: `frontend/.env`
- Required variable in use: `VITE_API_BASE_URL`
- API clients read base URL via `import.meta.env.VITE_API_BASE_URL`
- Vite dev proxy forwards `/api` to `http://localhost:8080`

## 7) Import and module conventions
- Use path alias `@` for `src` imports (configured in TS + Vite)
- Prefer alias imports for internal modules, especially cross-folder imports
- Keep external imports grouped before internal imports
- Keep type imports explicit when useful (`import type { ... }`)
- Prefer default exports for page-level components and slice reducers
- Prefer named exports for hooks, utilities, API hooks, and shared types

## 8) TypeScript conventions
Compiler constraints in `frontend/tsconfig.app.json`:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

Guidelines:
- Avoid `any`; use `unknown` and narrow safely
- Model API payloads with explicit `type`/`interface`
- Prefer narrow unions for variant fields (example: content block `type`)
- Use `ReturnType<typeof store.getState>` and `typeof store.dispatch` for Redux types
- Keep domain types near API modules unless broadly reused
- Validate untyped persisted data before use (cart/compare storage patterns)

## 9) React and state management conventions
- Functional components only
- Hooks at top level; no conditional hook calls
- Use typed Redux hooks from `src/app/hooks.ts`
- Keep app state in slices under `src/features/`
- Keep remote state in RTK Query modules under `src/api/`
- Use RTK Query generated hooks in UI pages/components
- Use lazy route loading in `src/routes/AppRoutes.tsx` for page bundles

## 10) API layer conventions
- Prefer RTK Query `createApi` modules per domain
- Set `Accept-Language` using active i18n language when needed
- Keep request/response types exported from API modules
- Use `providesTags` consistently for list/entity invalidation
- For mutations in UI, prefer `.unwrap()` + `try/catch`

## 11) Error handling guidelines
- Use `try/catch` around async UI operations that can fail
- In `catch`, treat errors as `unknown` and narrow before property access
- Show user-facing fallback messages when backend message is missing
- Do not silently swallow network errors unless intentionally non-critical
- For localStorage operations, fail safely (read -> `null`, write/remove -> ignore)

## 12) Formatting and code style
No dedicated formatter config is committed (no Prettier config found).

Practical rules:
- Follow style already used in the file you touch
- Avoid broad reformat-only changes

Observed dominant style in `src/`:
- Single quotes
- Minimal semicolons (often omitted)
- Trailing commas in multiline literals
- 2-space indentation in most files

## 13) Naming conventions
- Components/pages: PascalCase (`ProductPage.tsx`, `CategoryCard.tsx`)
- Hooks: `useXxx` (`useAppDispatch`, `useCartAnimation`)
- Slice variable names: camelCase + `Slice` suffix (`cartSlice`)
- Slice files: camelCase + `Slice.ts` (`cartSlice.ts`)
- API files: `<domain>Api.ts` (`productsApi.ts`, `blogsApi.ts`)
- Utility modules: camelCase (`cartStorage.ts`, `compareStorage.ts`)
- Constants: `UPPER_SNAKE_CASE`

## 14) i18n and content rules
- Prefer translated strings via `useTranslation()` and `t(...)`
- Avoid hardcoded UI text when translation keys exist
- Preserve Tolgee edit-mode behavior in `src/i18n/index.ts`
- Keep language-aware API headers aligned with active i18n language

## 15) Change scope and safety for agents
- Make focused, minimal changes for the requested task
- Do not introduce new tooling/config unless required by the task
- Do not alter env values or secrets unless explicitly requested
- Do not rename/move files without clear need
- If adding tests/tooling, update scripts and this file in the same change

## 16) Pre-PR checklist for this project
Before finishing substantial code changes, run:

```bash
npm run lint
npm run build
```

If tests are added later, run the affected single test and relevant suite too.
