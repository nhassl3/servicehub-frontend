# ServiceHub Frontend — Agent Guide

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` (type-check first, then bundle) |
| `npm run lint` | ESLint only — no Prettier, no stylelint |
| `npm run preview` | Vite preview of production build |

No test framework is configured (no test scripts in `package.json`).

## TypeScript strictures

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `noUnusedLocals` / `noUnusedParameters` — unused code will fail the build
- `erasableSyntaxOnly: true` — no `enum`, no `namespace`
- `strict: true`

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Router**: Routes defined inline in `App.tsx` using React Router v7 `<Routes>`.
  - Auth guards: `RequireAuth`, `RequireGuest`, `RequireVerifiedEmail` wrappers (defined in `App.tsx`)
  - `RequireAuth` redirects unverified emails to `/verify-email`
  - All routes sit inside `<Layout>` (Header + Outlet + Footer)
- **Context**: `AuthProvider` wraps `CartProvider` wraps routes in `App.tsx`
- **API client**: `src/api/client.ts` — Axios with Bearer token interceptor, automatic 401 → refresh → retry, and **GET deduplication** (handles StrictMode double-firing without per-component boilerplate)
- **Auth**: tokens stored in `localStorage` under `sh_access_token` / `sh_refresh_token`; cached user under `sh_cached_user`. Session expiry broadcasts `auth:session-expired` event.
- **i18n**: Side-effect import `import './i18n'` in `main.tsx`. Locales: `en`, `ru` in `src/i18n/locales/`. Detected via `localStorage` → `navigator`.
- **Styling**: Plain CSS files per component/page imported directly (no CSS modules, no CSS-in-JS). Global variables in `src/styles/variables.css`.

## Env vars

| Variable | Default |
|---|---|
| `VITE_API_URL` | `http://localhost:8080` |
| `VITE_MINIO_PUBLIC_URL` | `http://localhost:9000/` |

## Docker

Multi-stage build: Node 22-alpine → `npm ci && npm run build` → Nginx 1.27-alpine serves `dist/`. Nginx proxies `/api/` to `backend:8080` and has SPA fallback.

```sh
docker build --build-arg VITE_API_URL=http://localhost:8080 -t servicehub-frontend .
```

## Organization

- **Pages** in `src/pages/` — each exported as a named function (e.g. `export function HomePage()`)
- **API modules** in `src/api/` — one file per domain (`auth.ts`, `products.ts`, etc.)
- **Components** in `src/components/` — grouped by domain (`layout/`, `product/`, `cart/`, etc.)
- **Types** in `src/types/index.ts` — `User`, `Product`, `Cart`, `Order`, `Review`, etc.
- **Hooks** in `src/hooks/` — `useDebounce`, `useScrollToTop`, `useCurrencyConvreter`
- **Store** in `src/store/` — only `tokenStorage.ts`

## Conventions

- Components use `.tsx` extension; plain logic uses `.ts`
- CSS files at same level as their component (e.g. `HomePage.tsx` + `HomePage.css`)
- No barrel exports — import directly from file paths
