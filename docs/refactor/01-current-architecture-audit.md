# 01 — Current Architecture Audit

This document details the exact state of every directory and important module across the existing codebase, identifying responsibilities, defects, recommended destinations, priority, and migration risk.

---

## 1. Directory-by-Directory Audit

### `/ (Root Level)`
- **Files**: `server.ts`, `api/index.ts`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json`, `vercel.json`
- **Current Responsibility**: Mixed configuration, standalone server runner, Vercel serverless entry point, application bootstrap.
- **Problems**:
  - `server.ts` (743 lines) and `api/index.ts` (534 lines) contain ~450 lines of duplicate code (TOTP generation, SmartAPI connection management, user stores, auth logic).
  - Credentials fallbacks are hardcoded in source files.
  - `tsconfig.json` path mapping `@/*` maps to `./*` instead of standard `./src/*`.
- **Recommended Destination**:
  - Keep `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json` in root.
  - Move backend logic to `/server/` or `/backend/` and have `server.ts` and `api/index.ts` import the shared Express application and routes.
- **Priority**: P1 (Architecture Blocker)
- **Risk**: High

---

### `/src`
- **Files**: `App.tsx` (1,003 lines), `main.tsx` (177 lines), `index.css` (141 lines)
- **Current Responsibility**: Root frontend mounting, styling, monolithic application orchestration.
- **Problems**:
  - `src/App.tsx` is an anti-pattern "God Component". It manages auth state, landing page state, modal overlays, market subscriptions, strategy calculations, filtering, and tab switching.
  - `src/main.tsx` mixes theme definitions (`darkThemeConfig`, `lightThemeConfig`) with React DOM rendering.
- **Recommended Destination**:
  - Split `App.tsx` into `src/app/App.tsx`, `src/app/routes/`, `src/app/providers/`.
  - Extract Ant Design theme configurations into `src/styles/themeConfig.ts`.
- **Priority**: P1
- **Risk**: Medium-High

---

### `/src/components` (16 files)
- **Files**:
  - `AllRatiosScanner.tsx` (361 lines)
  - `AngelOneModal.tsx` (190 lines)
  - `ControlsPanel.tsx` (340 lines)
  - `FilterToolbar.tsx` (139 lines)
  - `HeaderBar.tsx` (436 lines)
  - `MarketSnapshotStrip.tsx` (135 lines)
  - `OptionChainDualView.tsx` (320 lines)
  - `PayoffChart.tsx` (195 lines)
  - `RatioMatrixSpreadsheet.tsx` (621 lines)
  - `RatioSpreadGrid.tsx` (310 lines)
  - `SelectedStrategyPanel.tsx` (352 lines)
  - `StatusBar.tsx` (110 lines)
  - `StockSelectorDropdown.tsx` (180 lines)
  - `StrategyControlBar.tsx` (412 lines)
  - `StrategyDetailDrawer.tsx` (390 lines)
  - `UnitTestsModal.tsx` (160 lines)
- **Current Responsibility**: Flat repository of all visual elements (views, widgets, toolbars, drawers, modals).
- **Problems**:
  - No separation between feature modules (`RatioMatrixSpreadsheet` vs `OptionChainDualView`) and shared presentational components (`HeaderBar`, `StatusBar`).
  - `RatioMatrixSpreadsheet.tsx` has heavy inline styling and calculation logic.
  - Multiple components calculate strategy payoffs independently instead of consuming domain services.
- **Recommended Destination**:
  - Domain features -> `src/features/{feature-name}/components/`
  - Shared UI -> `src/shared/components/`
- **Priority**: P1
- **Risk**: Medium

---

### `/src/engine` (4 files)
- **Files**: `blackScholes.ts`, `payoffEngine.ts`, `oiTracker.ts`, `engineTests.ts`
- **Current Responsibility**: High-precision options mathematical formulas (pricing, Greeks, IV solver, multi-leg payoffs, asymptotic slope analysis, OI delta tracking, test suite).
- **Problems**:
  - `engineTests.ts` contains both test data fixtures and runner logic; tightly coupled with UI modal `UnitTestsModal.tsx`.
  - Payoff engine types are imported from `../types/market` causing tight coupling between engine and UI types.
- **Recommended Destination**: `src/engine/` (maintain as quantitative core with pure input/output functions).
- **Priority**: P2 (Maintainability)
- **Risk**: Critical (Must preserve exact mathematical results)

---

### `/src/data` (8 files)
- **Files**: `angelInstrumentsMap.json`, `angelUnderlyings.json`, `bseCashUniverse.json`, `bseInstrumentsMap.json`, `bseUnderlyings.json`, `bseUniverse.ts`, `nseUniverse.ts`, `universeManager.ts`
- **Current Responsibility**: Static instruments dictionary, expiry resolution, strike steps, exchange token mapping.
- **Problems**:
  - Very large JSON files (~1.5MB total) imported directly into client bundles.
  - `universeManager.ts` acts as a facade over `nseUniverse.ts` and `bseUniverse.ts` with manual exchange branching.
- **Recommended Destination**: `src/data/` (or `src/features/market-universe/`).
- **Priority**: P2
- **Risk**: Low-Medium

---

### `/src/services` (2 files)
- **Files**: `authService.ts` (374 lines), `marketDataFeed.ts` (716 lines)
- **Current Responsibility**: Authentication client, localStorage session fallback, live market data feed, ticker simulator.
- **Problems**:
  - `authService.ts` contains mock demo credentials and duplicate mock database logic.
  - `marketDataFeed.ts` combines data fetching, WebSocket fallback simulation, Greek calculation updates, and event emitters.
- **Recommended Destination**:
  - `src/services/api/` (Normalized API clients)
  - `src/features/market-feed/services/` (Feed management)
  - `src/features/auth/services/` (Auth client)
- **Priority**: P1
- **Risk**: High

---

### `/src/pages` (7 files)
- **Files**: `AdminPage.tsx`, `ForgotPasswordPage.tsx`, `LandingPage.tsx`, `LoginPage.tsx`, `SettingsPage.tsx`, `SignupPage.tsx`, `TermsPage.tsx`
- **Current Responsibility**: Full-page views and settings/admin overlay panels.
- **Problems**:
  - Pages are rendered conditionally via state string in `App.tsx` (`viewMode === 'LOGIN'`, etc.) rather than a structured router or page container.
  - `AdminPage.tsx` and `SettingsPage.tsx` are treated both as pages and overlay modals.
- **Recommended Destination**: `src/pages/`
- **Priority**: P2
- **Risk**: Low

---

### `/src/types` (2 files)
- **Files**: `auth.ts`, `market.ts`
- **Current Responsibility**: Global TypeScript interfaces and types.
- **Problems**:
  - `market.ts` (280 lines) mixes market data feeds, contract quotes, strategy rows, matrix cells, filter configs, and preset types in one file.
- **Recommended Destination**:
  - Shared domain types -> `src/shared/types/`
  - Feature-specific types -> `src/features/{feature-name}/types/`
- **Priority**: P2
- **Risk**: Low

---

### `/src/context` (1 file)
- **Files**: `ThemeContext.tsx`
- **Current Responsibility**: Theme state provider (light/dark mode).
- **Problems**: DOM class manipulation is executed inside render effects; lacks integration with Ant Design token sync.
- **Recommended Destination**: `src/app/providers/ThemeProvider.tsx`
- **Priority**: P3
- **Risk**: Low

---

## 2. Architectural Defect Classification

| Defect Category | Count | Primary Affected Files | Priority |
| :--- | :---: | :--- | :---: |
| **Code Duplication (Backend)** | 4 | `server.ts`, `api/index.ts` | P0 |
| **God Components / Oversized Modules** | 3 | `src/App.tsx`, `src/services/marketDataFeed.ts`, `server.ts` | P1 |
| **Flat Architecture / Missing Feature Boundaries** | 16 | All files in `src/components/` | P1 |
| **State Ownership & Prop Drilling** | 5 | `App.tsx` passing 20+ props to `RatioMatrixSpreadsheet` & `HeaderBar` | P1 |
| **Type Co-location & Monolithic Type Files** | 2 | `src/types/market.ts` | P2 |
| **Hardcoded Values & Insecure Defaults** | 4 | `server.ts`, `api/index.ts`, `authService.ts` | P1 |
| **Inconsistent Route Handling** | 4 | `App.tsx` state-based pseudo router | P2 |
| **Total Identified Architectural Defects** | **38** | — | — |
