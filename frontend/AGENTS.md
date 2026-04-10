# AGENTS.md

High-signal guidance for OpenCode sessions in this repo.

## Scope and working directory

- Repo root has no runnable scripts; do app work in `frontend/`.
- `package.json` at repo root is dependency-only; `frontend/package.json` is the real command source.

## Verified commands (`frontend/`)

- `npm run dev` - Vite dev server on `0.0.0.0:5173`.
- `npm run build` - required typecheck + prod build (`tsc -b && vite build`).
- `npm run lint` - ESLint over the project.
- `npm run preview` - preview built app.
- `npm run knip` - unused files/exports/deps audit.
- `npm run deploy` - publishes `dist/` via `gh-pages` (depends on `predeploy`).

## Verification expectations

- No test runner is configured and no `*.test.*`/`*.spec.*` files exist.
- For meaningful verification, run: `npm run lint` then `npm run build`.

## Architecture map (frontend)

- Entry: `src/main.tsx` awaits `setupI18n()` before rendering React.
- Routing: `src/routes/AppRoutes.tsx` uses `React.lazy` + `Suspense` for page-level routes.
- State is mixed by design:
  - Redux Toolkit store in `src/app/store.ts`.
  - RTK Query APIs in `src/api/*Api.ts` and wired into store middleware/reducers.
  - Zustand modules under `src/zustand/` (used by `src/App.tsx` for image editor/static images).
- Persistence side effects happen in `store.subscribe()` for cart/compare via `src/utils/cartStorage.ts` and `src/utils/compareStorage.ts`.

## Env and runtime quirks

- Required env in `frontend/.env`: `VITE_API_BASE_URL`.
- Dev proxy forwards `/api` to `http://localhost:8080` (`vite.config.ts`).
- Path alias `@` points to `frontend/src` (TS + Vite config).
- Build includes `rollup-plugin-visualizer` with `open: true`; `npm run build` may try to open the report.

## i18n/Tolgee behavior to preserve

- `src/i18n/index.ts` supports edit mode via URL params `editor_key` and optional `tolgee_url`.
- Those params are copied to `sessionStorage` and then removed from URL.
- Non-edit mode loads translations from CDN via `i18next-http-backend`; edit mode initializes Tolgee + in-context tools.

## Style and agent constraints

- Existing code style is inconsistent; follow local file style and avoid broad reformatting.
- There is no active `.cursor`/Copilot instruction file or CI workflow in this repo right now.
