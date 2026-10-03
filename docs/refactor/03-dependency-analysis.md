# 03 — Dependency & Coupling Analysis

## 1. High Fan-In Modules (Core Dependencies)

These modules are imported by numerous other modules across the project. Any change to these modules has high blast radius:

| Module | Fan-In Count | Dependent Modules | Risk |
| :--- | :---: | :--- | :---: |
| `src/types/market.ts` | 18 | `App.tsx`, `payoffEngine.ts`, `marketDataFeed.ts`, `universeManager.ts`, all components | High |
| `src/data/universeManager.ts` | 11 | `App.tsx`, `marketDataFeed.ts`, `RatioMatrixSpreadsheet.tsx`, `ControlsPanel.tsx`, `OptionChainDualView.tsx`, `AllRatiosScanner.tsx` | High |
| `src/engine/payoffEngine.ts` | 6 | `App.tsx`, `RatioMatrixSpreadsheet.tsx`, `RatioSpreadGrid.tsx`, `SelectedStrategyPanel.tsx`, `PayoffChart.tsx`, `engineTests.ts` | Critical |
| `src/services/marketDataFeed.ts` | 5 | `App.tsx`, `HeaderBar.tsx`, `MarketSnapshotStrip.tsx`, `StatusBar.tsx`, `AngelOneModal.tsx` | High |
| `src/services/authService.ts` | 6 | `App.tsx`, `HeaderBar.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `SettingsPage.tsx`, `AdminPage.tsx` | Medium |

---

## 2. High Fan-Out Modules (High Coupling)

These modules import excessively from many different subsystems:

| Module | Fan-Out Count | Imported Subsystems | Problem |
| :--- | :---: | :--- | :--- |
| `src/App.tsx` | 27 | Types, authService, universeManager, marketDataFeed, payoffEngine, oiTracker, 14 components, 7 pages | God component centralizing all concern wires |
| `src/components/HeaderBar.tsx` | 8 | Types, auth types, theme context, auth service, stock selector, Ant Design, Lucide | Mixes navigation, user session, ticker metrics, exchange selector |
| `src/components/RatioMatrixSpreadsheet.tsx` | 7 | Types, universeManager, payoffEngine, Ant Design, sub-renderers | Combines cell calculations, formatting, layout, tooltips |

---

## 3. Circular Dependency & Coupling Warnings

1. **`src/types/market.ts` <-> `src/engine/payoffEngine.ts`**:
   - `payoffEngine.ts` imports `OptionType`, `LegSide`, `StrategyPayoffResult`, `PayoffPoint` from `../types/market`.
   - `market.ts` defines `RatioStrategyRow` which references `StrategyLeg` and `StrategyPayoffResult`.
   - *Fix in Phase 10*: Extract engine-specific calculation types to `src/engine/types.ts` or `src/shared/types/options.ts`.

2. **`server.ts` vs `api/index.ts` Coupling**:
   - Both files duplicate identical in-memory structures and TOTP functions. If one is edited without the other, local dev behavior diverges from Vercel production behavior.
   - *Fix in Phase 33–38*: Consolidate common Express application and router into `server/app.ts`.

3. **`src/components/OptionChainDualView.tsx` <-> `src/App.tsx`**:
   - `OptionChainDualView` accepts `onSelectStrike` and triggers tab switching back to `'MATRIX'`.
   - *Fix in Phase 25*: Route navigation and active tab should be managed via `TerminalContext` or URL state.

---

## 4. Third-Party Dependencies Audit

| Package | Version | Usage | Status |
| :--- | :---: | :--- | :---: |
| `react` / `react-dom` | `^19.0.0` | Core UI library | Healthy |
| `vite` | `^6.2.0` | Build tool & Dev server middleware | Healthy |
| `antd` | `^6.6.5` | UI Component Library (Table, Modal, Drawer, Select, Segmented) | Healthy |
| `@ant-design/icons` | `^6.3.4` | Icons for Ant Design widgets | Healthy |
| `lucide-react` | `^0.475.0` | Clean SVG financial/trading icons | Healthy |
| `motion` | `^12.4.7` | Smooth layout transitions | Healthy |
| `@tailwindcss/vite` | `^4.0.9` | Tailwind CSS v4 Vite plugin | Healthy |
| `express` | `^4.21.2` | Backend server | Healthy |
| `tsx` | `^4.19.3` | TypeScript Node runtime for dev | Healthy |
| `@google/genai` | `^2.4.0` | Included in package.json | Unused in frontend runtime (Reserved for AI Studio) |

---

## 5. Required Fixes Before Moving Code Files

1. **Step 1**: Establish path aliases in `tsconfig.json` and `vite.config.ts` (`@/app/*`, `@/features/*`, `@/shared/*`, `@/engine/*`, `@/data/*`, `@/services/*`, `@/store/*`).
2. **Step 2**: Decouple engine types from UI presentation types to prevent circular dependencies.
3. **Step 3**: Introduce `TerminalContext` and `MarketDataContext` to eliminate prop drilling from `App.tsx`.
