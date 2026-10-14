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

- `npm run test:laser` checks the laser selector across all series: material-specific limits, sheet rotation, tube wall/section/length, separate roll data, review vs exclusion, real availability, decimal validation and shareable `calc_laser_*` parameters. Selection is confined to `lazernye-stanki` and its non-accessory descendants; it must never estimate thickness from watts or copy sheet limits to combined-machine tube walls. The read-only `/products/category/{id}/laser-options` endpoint resolves the laser root and returns active models from every series. Missing/conflicting data stays in a separate review group; ordinary category trees and the bending calculator remain unchanged.

- `npm run test:calculator` runs the bending formula regression tests with the built-in Node test runner (Node 22.6+). No general UI test runner is configured.
- `npm run test:catalog` checks arbitrary-depth category trees, direct-only category browsing, and calculator eligibility only inside `listogibochnye-stanki` (not ancestors or accessories). `category_scope=direct` requires the matching backend; calculator selection uses `subtree`. Keep routed imports and category records unchanged when correcting this display behavior.
- `npm run test:filters` checks that manufacturer is listed first without merging manufacturer IDs with laser-source brands or mutating API filters.
- `npm run test:availability` checks warehouse/preorder/service statuses, unknown source quantities and RU/EN/KZ labels. Keep `inStock=false` for preorders; use `availability=ON_ORDER`, not fabricated stock. Archived duplicate URLs have `canonicalSlug`; the SEO server redirects them with 301, SPA replaces the route, and sitemap contains only active originals.
- Run this command when changing the calculator or its calculation helper.
- `npm run test:crm` checks background CRM copying, primary-save ordering, cart/product metadata, timeout/error isolation and duplicate prevention without sending real leads (Node 22.6+).
- Keep the original Contact and Cart forms. The shared `createInquiry.onQueryStarted` mirrors only successfully saved site inquiries to Bitrix form 6, without awaiting CRM or opening its widget. The exact supplied embed stays once in `index.html` for tracking; its hidden native trigger is NEVER clicked. CRM failures must not affect checkout/Telegram/site success. No browser storage of customer details and no automatic retries of ambiguous POSTs.
- Production `POST /inquiries` returns HTTP 201 with an empty body, not an inquiry DTO. Use RTK's requestId for duplicate prevention when no backend ID exists. `crmItems` holds client-only cart snapshots and is stripped before the primary API request; do not change its payload contract.
- The supplied CRM form currently has CONTACT_NAME and CONTACT_PHONE only. For email/comment/order/source/ID, its administrator must map hidden fields to `%site_email%`, `%site_message%`, `%site_order%`, `%site_source_url%`, `%site_inquiry_id%`. Sending these properties alone does not configure CRM fields. Browser delivery is best-effort (ad blockers/offline can block it); durable delivery requires a backend queue.
- `npm run test:seo` checks server HTML, unique metadata, canonical URLs, sitemap pagination, API failures and HTTP 404 responses using a local fixture API.
- SEO language URLs retain legacy RU paths and use `/en/` and `/kk/` for translated views; URL language is authoritative, not Accept-Language. `LanguageRouter` supplies a basename so existing internal Link/navigate calls retain the locale. Preserve calculator query strings and the Tolgee editor flow. Blog SSR/Article metadata and published article sitemap entries use the same helpers as SPA navigation. Unknown routes/assets and out-of-range catalog/blog pages return real 404; filter/calculator views use noindex and never publish a misleading ItemList.
- `npm run check:release -- --api http://127.0.0.1:18080/api/v1` is GET-only. Use the production API URL before a future storefront deployment and `--site` only against an already-running SEO server. The matching backend must expose `/catalog/capabilities`; do not deploy this storefront first against the old backend or copy the local database over production. The server reports an incompatible catalog API as 503, never as a false empty 200.
- Product/blog `seoLanguages` reports fully translated visible content, not merely a translated title. Untranslated localized views remain usable but are noindex, point canonical to RU and are excluded from hreflang/sitemap alternates until complete. SSR blog reads must use `/blogs/{slug}/seo`, which never increments views; the ordinary browser detail request retains view counting.
- It also covers component-brand exclusion, RU/EN/KZ paragraph translations, category breadcrumbs/ItemList and shared catalog filtering. Category graphs are built in `seo.mjs` for both server and client; do not replace them with a bare CollectionPage.
- Production serves the catalog through `node server.mjs`; Vite preview alone does not run the dynamic SEO/sitemap endpoints. Shared SEO helpers live in `seo.mjs` and must be copied into the runtime image.
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
