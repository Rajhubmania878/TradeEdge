# 16 — Verification Gate Checklist

This checklist must be executed and confirmed at the end of every refactoring phase.

---

## 1. Architecture & Dependency Gate
- [ ] Dependency direction is strictly valid: `App` -> `Pages` -> `Features` -> `Shared`.
- [ ] No module in `src/shared/` imports from `src/features/` or `src/pages/`.
- [ ] No circular imports detected by TypeScript (`npx tsc --noEmit`).
- [ ] Path aliases (`@/*`, `@/app/*`, `@/features/*`, `@/shared/*`) resolve cleanly in Vite and TypeScript.

---

## 2. Quantitative Financial Engine Gate
- [ ] `runStrategyEngineTestSuite()` executed and produces **17/17 Passing Tests**.
- [ ] 1:1 Bull Call Spread calculation verified (bounded debit & credit).
- [ ] 1:2 and 1:3 Call Ratio Spread peak profit and asymptotic unlimited loss verified.
- [ ] 1:3 Put Ratio Spread finite lower bound at Spot = 0 verified.
- [ ] Black-Scholes Greeks (Delta, Gamma, Theta, Vega) remain mathematically non-negative/correctly signed.
- [ ] Exchange strike step gap offsets calculate accurately on NSE and BSE universes.

---

## 3. Frontend & UI Workflows Gate
- [ ] View 1 (Ratio Matrix Spreadsheet) renders live spreadsheet grid with dynamically validated strike gap columns.
- [ ] View 2 (Spread Scanner) filters by Credit/Debit/OI and sorts by Net Entry and Profit.
- [ ] View 3 (Option Chain) displays dual Call/Put quotes with ATM highlight.
- [ ] View 4 (All Ratios Scanner) displays comparative 1:1, 1:2, 1:3, 2:3 columns.
- [ ] Clicking any strategy row opens the Strategy Detail Drawer with payoff chart.
- [ ] Exchange switcher toggles between NSE and BSE, updating symbols, expiries, lot sizes, and strike steps.
- [ ] Dark / Light mode toggle switches theme without style flashing.
- [ ] Fullscreen and Focus mode buttons operate cleanly.

---

## 4. Backend & API Gate
- [ ] Health check endpoint `GET /api/health` returns HTTP 200 `{ status: "ok" }`.
- [ ] Authentication endpoints (`/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`) work with Bearer sessions.
- [ ] Saved strategies endpoints (`GET`, `POST`, `DELETE /api/user/saved-strategies`) persist user presets.
- [ ] Admin management endpoints (`/api/admin/users`, `/api/admin/users/:id/status`) enforce `role === 'ADMIN'`.
- [ ] Market quote endpoint (`/api/angel/quote`) batches tokens without mixing NSE and BSE exchange segments.
- [ ] Both local standalone server (`server.ts`) and Vercel serverless adapter (`api/index.ts`) compile cleanly.

---

## 5. Quality & Compilation Gate
- [ ] `npm run lint` (or `npx tsc --noEmit`) passes with 0 errors.
- [ ] `npm run build` succeeds and produces optimized production bundles in `dist/`.
- [ ] No new runtime errors or unhandled promise rejections in browser console.
