# 15 — Phased Migration Guide (45 Implementation Phases)

This document specifies the exact 45 implementation phases required to safely refactor the application. Every phase is self-contained, independently verifiable, and designed for minimal context consumption.

---

## Phase 01 — Repository & Test Baseline Verification

### Goal
Verify and record the pristine baseline state of the entire repository before any file moves.

### Why now
Provides the definitive reference checkpoint and guarantees the application compiles and passes all 17 engine tests prior to changes.

### Scope
Execute typecheck, verify dev server build, run engine tests, and audit git status.

### Files affected
`src/engine/engineTests.ts`, `package.json`, `tsconfig.json`

### Files created
None

### Files moved
None

### Files modified
None

### Dependencies
None

### Actions
1. Run `npx tsc --noEmit` and confirm 0 fatal type errors.
2. Verify `runStrategyEngineTestSuite()` produces 17/17 passing tests.
3. Confirm dev server starts cleanly on port 3000.

### Import updates
None

### Behavioral constraints
Zero modifications to application code.

### Verification
`npm run lint` and engine test execution.

### Success criteria
17/17 engine tests pass; 0 compilation errors.

### Risks
None.

### Rollback
N/A (Read-only phase).

### Do not do
Do not edit any source files.

---

## Phase 02 — Path Aliases Configuration

### Goal
Configure TypeScript and Vite path aliases to support `@/*`, `@/app/*`, `@/features/*`, `@/shared/*`, `@/engine/*`, `@/data/*`, `@/services/*`, `@/store/*`, `@/styles/*`.

### Why now
Enables clean, absolute path imports before moving modules to new directories.

### Scope
Update `tsconfig.json` and `vite.config.ts`.

### Files affected
`/tsconfig.json`, `/vite.config.ts`

### Files created
None

### Files moved
None

### Files modified
`/tsconfig.json`, `/vite.config.ts`

### Dependencies
Phase 01

### Actions
1. Add explicit path mappings to `tsconfig.json` under `compilerOptions.paths`.
2. Update `vite.config.ts` `resolve.alias` mapping `@` to `path.resolve(__dirname, 'src')` while preserving backward compatibility.
3. Verify Vite builds test files using new aliases.

### Import updates
None yet.

### Behavioral constraints
No existing import paths broken.

### Verification
Run `npm run build` and `npm run lint`.

### Success criteria
Vite and TypeScript both resolve `@/engine/payoffEngine` correctly without runtime errors.

### Risks
Path alias resolution mismatch between Vite and `tsc`.

### Rollback
Revert `tsconfig.json` and `vite.config.ts` to git head.

### Do not do
Do not bulk-replace existing relative imports yet.

---

## Phase 03 — Shared Types Normalization

### Goal
Extract domain-agnostic and quantitative option types into separate clean type modules to eliminate circular dependencies.

### Why now
Must happen before features and engine files can be moved or referenced cleanly.

### Scope
Create `src/shared/types/options.ts`, `src/shared/types/market.ts`, `src/shared/types/auth.ts`.

### Files affected
`src/types/market.ts`, `src/types/auth.ts`

### Files created
`src/shared/types/options.ts`, `src/shared/types/market.ts`, `src/shared/types/auth.ts`, `src/shared/types/index.ts`

### Files moved
None

### Files modified
`src/types/market.ts`, `src/types/auth.ts` (re-exporting from shared types)

### Dependencies
Phase 02

### Actions
1. Create `src/shared/types/options.ts` containing `OptionType`, `LegSide`, `GapMode`, `DirectionMode`.
2. Create `src/shared/types/market.ts` containing `OptionContract`, `RatioStrategyRow`, `MarketFeedMetrics`.
3. Create `src/shared/types/auth.ts` containing `UserProfile`, `UserRole`, `UserPlan`.
4. Update `src/types/market.ts` and `src/types/auth.ts` as compatibility bridges.

### Import updates
Optional direct consumption in new files.

### Behavioral constraints
Type definitions must match existing field names and optionality exactly.

### Verification
`npm run lint`.

### Success criteria
No type errors across existing components importing from `src/types/*`.

### Risks
Type naming collisions.

### Rollback
Delete `src/shared/types/` and revert `src/types/`.

### Do not do
Do not rename interface properties.

---

## Phase 04 — Shared Utility Functions

### Goal
Extract common numerical formatting, currency display, and string helpers to `src/shared/utils/`.

### Why now
Used across multiple components (Matrix, Scanner, Payoff Chart).

### Scope
Create `src/shared/utils/formatters.ts`, `src/shared/utils/cn.ts`, `src/shared/utils/math.ts`.

### Files affected
`src/shared/utils/`

### Files created
`src/shared/utils/formatters.ts`, `src/shared/utils/cn.ts`, `src/shared/utils/math.ts`, `src/shared/utils/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 03

### Actions
1. Implement `formatRupee(num: number): string` with Indian numbering system (₹1,00,000).
2. Implement `formatPercent(num: number): string`.
3. Implement `formatGreeks(num: number, decimals: number): string`.
4. Implement standard class names joiner `cn(...classes: string[]): string`.

### Import updates
None yet.

### Behavioral constraints
Zero impact on existing UI formatting until consumed.

### Verification
Run `npm run lint`.

### Success criteria
Utility functions compile cleanly with full TypeScript type inference.

### Risks
None.

### Rollback
Delete `src/shared/utils/`.

### Do not do
Do not alter calculation rounding logic.

---

## Phase 05 — Shared Generic Custom Hooks

### Goal
Create reusable UI hooks (`useLocalStorage`, `useDebounce`, `useFullscreen`, `useMediaQuery`).

### Why now
Prepares state extraction from `App.tsx` and `HeaderBar.tsx`.

### Scope
Create `src/shared/hooks/`.

### Files affected
`src/shared/hooks/`

### Files created
`src/shared/hooks/useLocalStorage.ts`, `src/shared/hooks/useDebounce.ts`, `src/shared/hooks/useFullscreen.ts`, `src/shared/hooks/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 04

### Actions
1. Implement `useLocalStorage<T>(key: string, initialValue: T)`.
2. Implement `useDebounce<T>(value: T, delay: number)`.
3. Implement `useFullscreen()`.

### Import updates
None.

### Behavioral constraints
Pure hooks with safe SSR/browser window checks.

### Verification
`npm run lint`.

### Success criteria
Hooks compile with zero errors.

### Risks
None.

### Rollback
Delete `src/shared/hooks/`.

### Do not do
Do not bind hooks to domain state yet.

---

## Phase 06 — Design Tokens & CSS Variables

### Goal
Consolidate all design tokens into `src/styles/tokens.css` and map them cleanly to Tailwind v4 and Ant Design.

### Why now
Required before extracting shared UI primitives and theme providers.

### Scope
`src/styles/tokens.css`, `src/styles/themeConfig.ts`, `src/index.css`.

### Files affected
`src/index.css`, `src/main.tsx`

### Files created
`src/styles/tokens.css`, `src/styles/themeConfig.ts`

### Files moved
None

### Files modified
`src/index.css`, `src/main.tsx`

### Dependencies
Phase 05

### Actions
1. Create `src/styles/tokens.css` containing light/dark mode CSS custom properties.
2. Extract Ant Design `darkThemeConfig` and `lightThemeConfig` from `src/main.tsx` into `src/styles/themeConfig.ts`.
3. Import `tokens.css` inside `src/index.css`.

### Import updates
`src/main.tsx` imports theme configs from `src/styles/themeConfig.ts`.

### Behavioral constraints
Exact colors, font families, and border radii preserved identically.

### Verification
Visual inspection of dark/light theme switching in running browser.

### Success criteria
UI styling identical to pre-refactor state.

### Risks
Missing Ant Design token variable mapping.

### Rollback
Revert `src/index.css` and `src/main.tsx`.

### Do not do
Do not change primary brand colors or font sizes.

---

## Phase 07 — Shared UI Primitives: Badges & Tags

### Goal
Extract standardized Badge and Tag components (`CreditBadge`, `DebitBadge`, `AtmBadge`, `StatusBadge`).

### Why now
Used in Matrix cells, Scanner rows, and Status strips.

### Scope
Create `src/shared/components/feedback/Badges.tsx`.

### Files affected
`src/shared/components/feedback/`

### Files created
`src/shared/components/feedback/Badges.tsx`, `src/shared/components/feedback/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 06

### Actions
1. Implement `CreditBadge({ amount: number, lotSize?: number })`.
2. Implement `DebitBadge({ amount: number, lotSize?: number })`.
3. Implement `AtmBadge({ strike: number, isAtm: boolean })`.
4. Export from `src/shared/components/index.ts`.

### Import updates
None yet.

### Behavioral constraints
Maintain existing emerald/rose badge styling.

### Verification
`npm run lint`.

### Success criteria
Components render with expected CSS tokens.

### Risks
None.

### Rollback
Delete `src/shared/components/feedback/Badges.tsx`.

### Do not do
Do not alter badge threshold values.

---

## Phase 08 — Shared UI Primitives: Stock & Expiry Selectors

### Goal
Move `StockSelectorDropdown.tsx` to `src/shared/components/inputs/`.

### Why now
Encapsulates stock search and exchange dropdown for Header and Controls panel.

### Scope
`src/components/StockSelectorDropdown.tsx` -> `src/shared/components/inputs/StockSelectorDropdown.tsx`.

### Files affected
`src/components/StockSelectorDropdown.tsx`, `src/components/HeaderBar.tsx`, `src/components/ControlsPanel.tsx`

### Files created
`src/shared/components/inputs/StockSelectorDropdown.tsx`

### Files moved
`src/components/StockSelectorDropdown.tsx` -> `src/shared/components/inputs/StockSelectorDropdown.tsx`

### Files modified
`src/components/HeaderBar.tsx`, `src/components/ControlsPanel.tsx`, `src/components/StockSelectorDropdown.tsx` (bridge)

### Dependencies
Phase 07

### Actions
1. Move `StockSelectorDropdown.tsx` to `src/shared/components/inputs/`.
2. Add bridge re-export in `src/components/StockSelectorDropdown.tsx`.
3. Update imports in `HeaderBar.tsx` and `ControlsPanel.tsx`.

### Import updates
Update import paths to `@/shared/components/inputs/StockSelectorDropdown`.

### Behavioral constraints
Stock search filtering, sector tags, and keyboard selection behavior unchanged.

### Verification
Search for "RELIANCE" in dropdown; switch to BSE and search for "TCS".

### Success criteria
Dropdown functions smoothly on both NSE and BSE.

### Risks
Import path breakages.

### Rollback
Move file back to `src/components/StockSelectorDropdown.tsx`.

### Do not do
Do not rewrite search filtering algorithm.

---

## Phase 09 — Shared UI Navigation: HeaderBar

### Goal
Move `HeaderBar.tsx` to `src/shared/components/navigation/HeaderBar.tsx`.

### Why now
Prepares root layout extraction.

### Scope
`src/components/HeaderBar.tsx` -> `src/shared/components/navigation/HeaderBar.tsx`.

### Files affected
`src/components/HeaderBar.tsx`, `src/App.tsx`

### Files created
`src/shared/components/navigation/HeaderBar.tsx`

### Files moved
`src/components/HeaderBar.tsx` -> `src/shared/components/navigation/HeaderBar.tsx`

### Files modified
`src/App.tsx`, `src/components/HeaderBar.tsx` (bridge)

### Dependencies
Phase 08

### Actions
1. Move `HeaderBar.tsx` to `src/shared/components/navigation/`.
2. Maintain compatibility bridge in `src/components/HeaderBar.tsx`.
3. Update `src/App.tsx` import.

### Import updates
`import { HeaderBar } from '@/shared/components/navigation/HeaderBar'`

### Behavioral constraints
All 4 main tabs, Angel One modal toggle, Unit test modal toggle, ratio selector, and user profile dropdown must remain functional.

### Verification
Click all top-bar tabs, switch dark/light theme, toggle streaming.

### Success criteria
Header renders with full interactivity.

### Risks
Missed modal callback handlers.

### Rollback
Move `HeaderBar.tsx` back to `src/components/`.

### Do not do
Do not change tab keys or callback prop signatures.

---

## Phase 10 — Shared UI Feedback: StatusBar

### Goal
Move `StatusBar.tsx` to `src/shared/components/feedback/StatusBar.tsx`.

### Why now
Prepares bottom layout bar extraction.

### Scope
`src/components/StatusBar.tsx` -> `src/shared/components/feedback/StatusBar.tsx`.

### Files affected
`src/components/StatusBar.tsx`, `src/App.tsx`

### Files created
`src/shared/components/feedback/StatusBar.tsx`

### Files moved
`src/components/StatusBar.tsx` -> `src/shared/components/feedback/StatusBar.tsx`

### Files modified
`src/App.tsx`, `src/components/StatusBar.tsx` (bridge)

### Dependencies
Phase 09

### Actions
1. Move `StatusBar.tsx` to `src/shared/components/feedback/`.
2. Maintain bridge in `src/components/StatusBar.tsx`.
3. Update `src/App.tsx` import.

### Import updates
`import { StatusBar } from '@/shared/components/feedback/StatusBar'`

### Behavioral constraints
Live latency counter, tick rate, spot price, straddle value, and DTE must display accurately.

### Verification
Check status bar values against market feed ticks.

### Success criteria
Telemetry displays live updates without React re-render warnings.

### Risks
None.

### Rollback
Move back to `src/components/StatusBar.tsx`.

### Do not do
Do not remove metrics indicators.

---

## Phase 11 — Shared UI Feedback: UnitTestsModal

### Goal
Move `UnitTestsModal.tsx` to `src/shared/components/feedback/UnitTestsModal.tsx`.

### Why now
Decouples developer regression test UI from business components.

### Scope
`src/components/UnitTestsModal.tsx` -> `src/shared/components/feedback/UnitTestsModal.tsx`.

### Files affected
`src/components/UnitTestsModal.tsx`, `src/App.tsx`

### Files created
`src/shared/components/feedback/UnitTestsModal.tsx`

### Files moved
`src/components/UnitTestsModal.tsx` -> `src/shared/components/feedback/UnitTestsModal.tsx`

### Files modified
`src/App.tsx`, `src/components/UnitTestsModal.tsx` (bridge)

### Dependencies
Phase 10

### Actions
1. Move `UnitTestsModal.tsx` to `src/shared/components/feedback/`.
2. Maintain bridge in `src/components/UnitTestsModal.tsx`.
3. Update `src/App.tsx` import.

### Import updates
`import { UnitTestsModal } from '@/shared/components/feedback/UnitTestsModal'`

### Behavioral constraints
Clicking "Run All Tests" executes `runStrategyEngineTestSuite()` and displays all 17 test cards with pass/fail badges.

### Verification
Open Modal in browser and run suite; confirm 17/17 green badges.

### Success criteria
17/17 passing tests displayed inside modal.

### Risks
None.

### Rollback
Move back to `src/components/UnitTestsModal.tsx`.

### Do not do
Do not alter test execution logic.

---

## Phase 12 — App Providers Normalization

### Goal
Move `ThemeContext.tsx` to `src/app/providers/ThemeProvider.tsx` and create `AppProviders.tsx`.

### Why now
Establishes the clean provider hierarchy before state stores are extracted.

### Scope
`src/context/ThemeContext.tsx` -> `src/app/providers/ThemeProvider.tsx`, create `src/app/providers/AppProviders.tsx`.

### Files affected
`src/context/ThemeContext.tsx`, `src/main.tsx`

### Files created
`src/app/providers/ThemeProvider.tsx`, `src/app/providers/AppProviders.tsx`, `src/app/providers/index.ts`

### Files moved
`src/context/ThemeContext.tsx` -> `src/app/providers/ThemeProvider.tsx`

### Files modified
`src/main.tsx`, `src/context/ThemeContext.tsx` (bridge)

### Dependencies
Phase 11

### Actions
1. Move `ThemeContext.tsx` to `src/app/providers/ThemeProvider.tsx`.
2. Create `AppProviders.tsx` wrapping `ThemeProvider` and Ant Design `ConfigProvider`.
3. Update `src/main.tsx` to mount `<AppProviders><App /></AppProviders>`.

### Import updates
`src/main.tsx` imports `AppProviders` from `@/app/providers`.

### Behavioral constraints
Dark/Light mode persistence in `localStorage` ('app_theme_mode') and HTML `data-theme` attribute unchanged.

### Verification
Toggle theme button in header; verify `dark` class toggles on `<html>`.

### Success criteria
Theme switches smoothly with 0 console warnings.

### Risks
Theme flash on initial mount.

### Rollback
Revert `src/main.tsx` and restore `src/context/ThemeContext.tsx`.

### Do not do
Do not remove `localStorage` persistence key.

---

## Phase 13 — Layout Architecture Extraction

### Goal
Create `TerminalLayout.tsx` and `AuthLayout.tsx` under `src/app/layouts/`.

### Why now
Relieves `App.tsx` of top-level shell layout responsibilities.

### Scope
Create `src/app/layouts/TerminalLayout.tsx`, `src/app/layouts/AuthLayout.tsx`.

### Files affected
`src/app/layouts/`

### Files created
`src/app/layouts/TerminalLayout.tsx`, `src/app/layouts/AuthLayout.tsx`, `src/app/layouts/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 12

### Actions
1. Implement `TerminalLayout` composing `HeaderBar`, optional `MarketSnapshotStrip`, main content `<slot>`, and `StatusBar`.
2. Implement `AuthLayout` providing a centered responsive backdrop for auth cards.

### Import updates
None yet.

### Behavioral constraints
Layout padding, full-screen mode, and focus mode styling preserved.

### Verification
`npm run lint`.

### Success criteria
Layouts compile cleanly.

### Risks
None.

### Rollback
Delete `src/app/layouts/`.

### Do not do
Do not alter responsive container max-widths.

---

## Phase 14 — Page Boundaries: Landing & Auth Pages

### Goal
Move standalone marketing and authentication pages into structured subdirectories under `src/pages/`.

### Why now
Organizes route-level page composition before refactoring page internals.

### Scope
Move `LandingPage.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `ForgotPasswordPage.tsx`, `TermsPage.tsx`.

### Files affected
`src/pages/*`, `src/App.tsx`

### Files created
`src/pages/landing/LandingPage.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/SignupPage.tsx`, `src/pages/auth/ForgotPasswordPage.tsx`, `src/pages/auth/TermsPage.tsx`

### Files moved
`src/pages/LandingPage.tsx` -> `src/pages/landing/LandingPage.tsx`, `src/pages/LoginPage.tsx` -> `src/pages/auth/LoginPage.tsx`, `src/pages/SignupPage.tsx` -> `src/pages/auth/SignupPage.tsx`, `src/pages/ForgotPasswordPage.tsx` -> `src/pages/auth/ForgotPasswordPage.tsx`, `src/pages/TermsPage.tsx` -> `src/pages/auth/TermsPage.tsx`

### Files modified
`src/App.tsx`, legacy `src/pages/*` bridges

### Dependencies
Phase 13

### Actions
1. Move pages into `landing/` and `auth/` folders.
2. Create bridge exports in original `src/pages/` paths.
3. Update imports in `src/App.tsx`.

### Import updates
`import { LandingPage } from '@/pages/landing/LandingPage'`, etc.

### Behavioral constraints
Login form validation, registration flow, demo account quick-fill buttons, and terms view unchanged.

### Verification
Navigate between Landing -> Login -> Signup -> Terms.

### Success criteria
All auth pages render with full functionality.

### Risks
Broken navigation callbacks.

### Rollback
Move pages back to `src/pages/`.

### Do not do
Do not modify auth form submission logic yet.

---

## Phase 15 — Page Boundaries: Settings & Admin Pages

### Goal
Move `SettingsPage.tsx` and `AdminPage.tsx` to `src/pages/settings/` and `src/pages/admin/`.

### Why now
Completes page directory structuring.

### Scope
`src/pages/SettingsPage.tsx` -> `src/pages/settings/SettingsPage.tsx`, `src/pages/AdminPage.tsx` -> `src/pages/admin/AdminPage.tsx`.

### Files affected
`src/pages/SettingsPage.tsx`, `src/pages/AdminPage.tsx`, `src/App.tsx`

### Files created
`src/pages/settings/SettingsPage.tsx`, `src/pages/admin/AdminPage.tsx`

### Files moved
`src/pages/SettingsPage.tsx` -> `src/pages/settings/SettingsPage.tsx`, `src/pages/AdminPage.tsx` -> `src/pages/admin/AdminPage.tsx`

### Files modified
`src/App.tsx`, legacy `src/pages/*` bridges

### Dependencies
Phase 14

### Actions
1. Move settings and admin pages to respective directories.
2. Maintain bridge exports.
3. Update imports in `App.tsx`.

### Import updates
`import { SettingsPage } from '@/pages/settings/SettingsPage'`, `import { AdminPage } from '@/pages/admin/AdminPage'`.

### Behavioral constraints
Admin user table (status toggle, role change, plan upgrade) and user settings remain fully functional.

### Verification
Log in as `admin@ratiospread.com` / `Admin123!` -> open Admin drawer -> toggle user status.

### Success criteria
Admin table updates user records without errors.

### Risks
Admin permission check failure.

### Rollback
Move files back to `src/pages/`.

### Do not do
Do not alter admin API payloads.

---

## Phase 16 — First Feature Extraction: Payoff Analyzer

### Goal
Extract `PayoffChart.tsx` into `src/features/payoff-analyzer/`.

### Why now
`PayoffChart` is a leaf visualizer for risk curves and has minimal external couplings.

### Scope
`src/components/PayoffChart.tsx` -> `src/features/payoff-analyzer/components/PayoffChart.tsx`.

### Files affected
`src/components/PayoffChart.tsx`, `src/components/SelectedStrategyPanel.tsx`, `src/components/StrategyDetailDrawer.tsx`

### Files created
`src/features/payoff-analyzer/components/PayoffChart.tsx`, `src/features/payoff-analyzer/index.ts`

### Files moved
`src/components/PayoffChart.tsx` -> `src/features/payoff-analyzer/components/PayoffChart.tsx`

### Files modified
`src/components/SelectedStrategyPanel.tsx`, `src/components/StrategyDetailDrawer.tsx`, `src/components/PayoffChart.tsx` (bridge)

### Dependencies
Phase 15

### Actions
1. Create `src/features/payoff-analyzer/components/` and move `PayoffChart.tsx`.
2. Add bridge re-export in `src/components/PayoffChart.tsx`.
3. Update imports in `SelectedStrategyPanel` and `StrategyDetailDrawer`.

### Import updates
`import { PayoffChart } from '@/features/payoff-analyzer'`

### Behavioral constraints
Payoff curve SVG rendering, spot line indicator, zero P&L axis, and breakeven dots must render identically.

### Verification
Select any strategy row in matrix; verify payoff chart renders smooth curve.

### Success criteria
Chart renders with spot marker and breakeven vertices.

### Risks
SVG viewBox scaling bugs.

### Rollback
Move `PayoffChart.tsx` back to `src/components/`.

### Do not do
Do not alter chart coordinate mapping.

---

## Phase 17 — Feature Extraction: Market Feed & Live Snapshot

### Goal
Extract `MarketSnapshotStrip.tsx` and `AngelOneModal.tsx` into `src/features/market-feed/`.

### Why now
Encapsulates real-time market data feed controls and telemetry strip.

### Scope
`src/components/MarketSnapshotStrip.tsx`, `src/components/AngelOneModal.tsx` -> `src/features/market-feed/components/`.

### Files affected
`src/components/MarketSnapshotStrip.tsx`, `src/components/AngelOneModal.tsx`, `src/App.tsx`

### Files created
`src/features/market-feed/components/MarketSnapshotStrip.tsx`, `src/features/market-feed/components/AngelOneModal.tsx`, `src/features/market-feed/index.ts`

### Files moved
`src/components/MarketSnapshotStrip.tsx` -> `src/features/market-feed/components/MarketSnapshotStrip.tsx`, `src/components/AngelOneModal.tsx` -> `src/features/market-feed/components/AngelOneModal.tsx`

### Files modified
`src/App.tsx`, bridge files in `src/components/`

### Dependencies
Phase 16

### Actions
1. Move `MarketSnapshotStrip.tsx` and `AngelOneModal.tsx` to `src/features/market-feed/components/`.
2. Create bridge exports in `src/components/`.
3. Update imports in `src/App.tsx`.

### Import updates
`import { MarketSnapshotStrip } from '@/features/market-feed'`
`import { AngelOneModal } from '@/features/market-feed'`

### Behavioral constraints
Cash spot price, future price, basis, ATM straddle value, and DTE refresh on live ticks.

### Verification
Click "Sync Quotes" button in snapshot strip; confirm latency indicator updates.

### Success criteria
Snapshot strip shows live feed ticks.

### Risks
None.

### Rollback
Move files back to `src/components/`.

### Do not do
Do not change straddle calculation formula.

---

## Phase 18 — Feature Extraction: User Strategies & Presets

### Goal
Extract `SelectedStrategyPanel.tsx` and `StrategyDetailDrawer.tsx` into `src/features/user-strategies/`.

### Why now
Encapsulates strategy inspection, risk statistics, and preset saving.

### Scope
`src/components/SelectedStrategyPanel.tsx`, `src/components/StrategyDetailDrawer.tsx` -> `src/features/user-strategies/components/`.

### Files affected
`src/components/SelectedStrategyPanel.tsx`, `src/components/StrategyDetailDrawer.tsx`, `src/App.tsx`, `src/components/RatioMatrixSpreadsheet.tsx`, `src/components/RatioSpreadGrid.tsx`

### Files created
`src/features/user-strategies/components/SelectedStrategyPanel.tsx`, `src/features/user-strategies/components/StrategyDetailDrawer.tsx`, `src/features/user-strategies/index.ts`

### Files moved
`src/components/SelectedStrategyPanel.tsx` -> `src/features/user-strategies/components/SelectedStrategyPanel.tsx`, `src/components/StrategyDetailDrawer.tsx` -> `src/features/user-strategies/components/StrategyDetailDrawer.tsx`

### Files modified
`src/App.tsx`, `RatioMatrixSpreadsheet.tsx`, `RatioSpreadGrid.tsx`, bridge files

### Dependencies
Phase 17

### Actions
1. Move components to `src/features/user-strategies/components/`.
2. Create bridge exports in `src/components/`.
3. Update imports in consumers.

### Import updates
`import { SelectedStrategyPanel, StrategyDetailDrawer } from '@/features/user-strategies'`

### Behavioral constraints
Strategy legs summary, net entry debit/credit pill, max profit, max loss (unlimited guard), and Greek totals match exact math.

### Verification
Click any strategy cell in Matrix -> verify drawer opens with leg execution prices.

### Success criteria
Drawer opens with correct payoff curve and save preset button.

### Risks
Broken leg price display.

### Rollback
Move files back to `src/components/`.

### Do not do
Do not modify payoff result formatting.

---

## Phase 19 — Feature Extraction: Spread Scanner & Grid

### Goal
Extract `ControlsPanel.tsx`, `FilterToolbar.tsx`, and `RatioSpreadGrid.tsx` into `src/features/spread-scanner/`.

### Why now
Encapsulates View 2 (Spread Scanner) components.

### Scope
`src/components/ControlsPanel.tsx`, `src/components/FilterToolbar.tsx`, `src/components/RatioSpreadGrid.tsx` -> `src/features/spread-scanner/components/`.

### Files affected
`src/components/ControlsPanel.tsx`, `src/components/FilterToolbar.tsx`, `src/components/RatioSpreadGrid.tsx`, `src/App.tsx`

### Files created
`src/features/spread-scanner/components/ControlsPanel.tsx`, `src/features/spread-scanner/components/FilterToolbar.tsx`, `src/features/spread-scanner/components/RatioSpreadGrid.tsx`, `src/features/spread-scanner/index.ts`

### Files moved
Files moved to `src/features/spread-scanner/components/`

### Files modified
`src/App.tsx`, bridge files in `src/components/`

### Dependencies
Phase 18

### Actions
1. Move scanner components to `src/features/spread-scanner/components/`.
2. Create bridge exports in `src/components/`.
3. Update imports in `src/App.tsx`.

### Import updates
`import { ControlsPanel, FilterToolbar, RatioSpreadGrid } from '@/features/spread-scanner'`

### Behavioral constraints
Scanner sorting (by Net Entry, Max Profit, Delta, Theta, OI) and filters (Credit Only, Debit Only, Min OI) work identically.

### Verification
Switch to "Spread Scanner" tab -> sort by "Net Entry" ASC -> filter by "Credit Only".

### Success criteria
Grid filters and sorts rows accurately.

### Risks
Sort direction inversion.

### Rollback
Move files back to `src/components/`.

### Do not do
Do not alter scanner filter predicate logic.

---

## Phase 20 — Feature Extraction: Option Chain Dual View

### Goal
Extract `OptionChainDualView.tsx` into `src/features/option-chain/`.

### Why now
Encapsulates View 3 (Option Chain) components.

### Scope
`src/components/OptionChainDualView.tsx` -> `src/features/option-chain/components/OptionChainDualView.tsx`.

### Files affected
`src/components/OptionChainDualView.tsx`, `src/App.tsx`

### Files created
`src/features/option-chain/components/OptionChainDualView.tsx`, `src/features/option-chain/index.ts`

### Files moved
`src/components/OptionChainDualView.tsx` -> `src/features/option-chain/components/OptionChainDualView.tsx`

### Files modified
`src/App.tsx`, `src/components/OptionChainDualView.tsx` (bridge)

### Dependencies
Phase 19

### Actions
1. Move component to `src/features/option-chain/components/`.
2. Create bridge export in `src/components/OptionChainDualView.tsx`.
3. Update import in `src/App.tsx`.

### Import updates
`import { OptionChainDualView } from '@/features/option-chain'`

### Behavioral constraints
Side-by-side Call (left) / Put (right) quotes, ATM strike row highlight, ITM shading, and strike selection work smoothly.

### Verification
Switch to "Option Chain" tab; inspect Call LTP and Put LTP for RELIANCE.

### Success criteria
Option chain renders both sides with real-time quote updates.

### Risks
Misaligned Call/Put rows.

### Rollback
Move back to `src/components/OptionChainDualView.tsx`.

### Do not do
Do not remove strike step moneyness shading.

---

## Phase 21 — Feature Extraction: All Ratios Scanner

### Goal
Extract `AllRatiosScanner.tsx` into `src/features/all-ratios/`.

### Why now
Encapsulates View 4 (All Ratios Comparative Matrix).

### Scope
`src/components/AllRatiosScanner.tsx` -> `src/features/all-ratios/components/AllRatiosScanner.tsx`.

### Files affected
`src/components/AllRatiosScanner.tsx`, `src/App.tsx`

### Files created
`src/features/all-ratios/components/AllRatiosScanner.tsx`, `src/features/all-ratios/index.ts`

### Files moved
`src/components/AllRatiosScanner.tsx` -> `src/features/all-ratios/components/AllRatiosScanner.tsx`

### Files modified
`src/App.tsx`, `src/components/AllRatiosScanner.tsx` (bridge)

### Dependencies
Phase 20

### Actions
1. Move component to `src/features/all-ratios/components/`.
2. Create bridge export in `src/components/AllRatiosScanner.tsx`.
3. Update import in `src/App.tsx`.

### Import updates
`import { AllRatiosScanner } from '@/features/all-ratios'`

### Behavioral constraints
Comparative 1:1, 1:2, 1:3, 2:3, 2:5 ratio columns generate and compare net entry values across strikes.

### Verification
Switch to "All Ratios" tab; check credit/debit values across ratio columns.

### Success criteria
Comparative matrix displays multiple ratio columns with proper credit/debit color coding.

### Risks
None.

### Rollback
Move back to `src/components/AllRatiosScanner.tsx`.

### Do not do
Do not alter ratio generator combinations.

---

## Phase 22 — Flagship Feature Extraction: Ratio Matrix Spreadsheet

### Goal
Extract `RatioMatrixSpreadsheet.tsx` and `StrategyControlBar.tsx` into `src/features/ratio-matrix/`.

### Why now
Encapsulates View 1 (Flagship Ratio Matrix Spreadsheet).

### Scope
`src/components/RatioMatrixSpreadsheet.tsx`, `src/components/StrategyControlBar.tsx` -> `src/features/ratio-matrix/components/`.

### Files affected
`src/components/RatioMatrixSpreadsheet.tsx`, `src/components/StrategyControlBar.tsx`, `src/App.tsx`

### Files created
`src/features/ratio-matrix/components/RatioMatrixSpreadsheet.tsx`, `src/features/ratio-matrix/components/StrategyControlBar.tsx`, `src/features/ratio-matrix/index.ts`

### Files moved
Files moved to `src/features/ratio-matrix/components/`

### Files modified
`src/App.tsx`, bridge files in `src/components/`

### Dependencies
Phase 21

### Actions
1. Move matrix components to `src/features/ratio-matrix/components/`.
2. Create bridge exports in `src/components/`.
3. Update imports in `src/App.tsx`.

### Import updates
`import { RatioMatrixSpreadsheet, StrategyControlBar } from '@/features/ratio-matrix'`

### Behavioral constraints
GAP (₹50), CNT (5), STK (AUTO), MIN, MAX strike controls, moneyness badges, and cell click selections must work flawlessly.

### Verification
Change GAP to ₹20, CNT to 6; verify table dynamically adjusts columns and renders valid net entries.

### Success criteria
Matrix renders valid spreadsheet cells with live tick flashes.

### Risks
Cell memoization failure causing sluggish ticks.

### Rollback
Move files back to `src/components/`.

### Do not do
Do not modify gap multiplication formula (`gap * i`).

---

## Phase 23 — Matrix Sub-Component Decomposition

### Goal
Split `RatioMatrixSpreadsheet.tsx` into modular sub-components (`MatrixStrikeRow`, `MatrixCellRenderer`, `GapStepHeader`).

### Why now
Reduces `RatioMatrixSpreadsheet.tsx` from 621 lines to < 200 lines for high maintainability.

### Scope
`src/features/ratio-matrix/components/`

### Files affected
`src/features/ratio-matrix/components/RatioMatrixSpreadsheet.tsx`

### Files created
`src/features/ratio-matrix/components/MatrixStrikeRow.tsx`, `src/features/ratio-matrix/components/MatrixCellRenderer.tsx`, `src/features/ratio-matrix/components/GapStepHeader.tsx`

### Files moved
None

### Files modified
`src/features/ratio-matrix/components/RatioMatrixSpreadsheet.tsx`

### Dependencies
Phase 22

### Actions
1. Extract cell render logic into `MatrixCellRenderer.tsx`.
2. Extract strike row structure into `MatrixStrikeRow.tsx`.
3. Extract header columns into `GapStepHeader.tsx`.
4. Compose cleanly in `RatioMatrixSpreadsheet.tsx`.

### Import updates
Internal to `src/features/ratio-matrix/`.

### Behavioral constraints
Exact cell styling, net debit/credit color thresholds, and tooltip data preserved.

### Verification
Hover over matrix cell; verify tooltip shows Buy Leg, Sell Leg, Net Debit/Credit, and Max Profit.

### Success criteria
Tooltips and selection state match original functionality.

### Risks
Broken tooltip data binding.

### Rollback
Revert `RatioMatrixSpreadsheet.tsx` to pre-split state.

### Do not do
Do not alter tooltip formatting strings.

---

## Phase 24 — Quantitative Engine Facade Normalization

### Goal
Create unified index export for `src/engine/` (`blackScholes.ts`, `payoffEngine.ts`, `oiTracker.ts`, `engineTests.ts`).

### Why now
Provides clean public API for quantitative operations.

### Scope
`src/engine/index.ts`

### Files affected
`src/engine/`

### Files created
`src/engine/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 23

### Actions
1. Create `src/engine/index.ts` exporting:
   - `calculateBlackScholes`, `calculateImpliedVolatility` from `./blackScholes`
   - `evaluateStrategyPayoff`, `calculateStrategyPayoffAtSpot` from `./payoffEngine`
   - `oiTracker` from `./oiTracker`
   - `runStrategyEngineTestSuite` from `./engineTests`

### Import updates
Optional consumption in features via `import { ... } from '@/engine'`.

### Behavioral constraints
Mathematical algorithms strictly unchanged.

### Verification
Run `runStrategyEngineTestSuite()`; confirm 17/17 pass.

### Success criteria
All 17 engine tests pass.

### Risks
None.

### Rollback
Delete `src/engine/index.ts`.

### Do not do
Do not modify numerical constants in math files.

---

## Phase 25 — Market Universe Facade Normalization

### Goal
Create unified index export for `src/data/` (`universeManager.ts`, `nseUniverse.ts`, `bseUniverse.ts`).

### Why now
Provides clean public API for exchange data queries.

### Scope
`src/data/index.ts`

### Files affected
`src/data/`

### Files created
`src/data/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 24

### Actions
1. Create `src/data/index.ts` exporting all functions from `universeManager.ts`.

### Import updates
Optional consumption via `import { ... } from '@/data'`.

### Behavioral constraints
NSE/BSE token mapping and listed strike arrays unchanged.

### Verification
Run engine tests TEST 15, 16, 17.

### Success criteria
Tests 15, 16, 17 pass.

### Risks
None.

### Rollback
Delete `src/data/index.ts`.

### Do not do
Do not modify underlying JSON data files.

---

## Phase 26 — Domain Store: AuthContext

### Goal
Implement `AuthContext.tsx` to manage user profile, token, login, and logout state.

### Why now
Relieves `App.tsx` of authentication state management.

### Scope
`src/store/AuthContext.tsx`

### Files affected
`src/store/`

### Files created
`src/store/AuthContext.tsx`, `src/store/index.ts`

### Files moved
None

### Files modified
`src/app/providers/AppProviders.tsx`

### Dependencies
Phase 25

### Actions
1. Implement `AuthProvider` and `useAuth()` hook in `src/store/AuthContext.tsx`.
2. Wrap `AuthProvider` inside `AppProviders.tsx`.

### Import updates
Components consume `useAuth()` for user session.

### Behavioral constraints
Session restore on reload from `localStorage` preserved.

### Verification
Log in, refresh browser, verify user remains logged in.

### Success criteria
User session persists across browser reload.

### Risks
Session synchronization race conditions.

### Rollback
Remove `AuthProvider` from `AppProviders.tsx`.

### Do not do
Do not remove offline session fallback.

---

## Phase 27 — Domain Store: TerminalContext

### Goal
Implement `TerminalContext.tsx` to manage active exchange, symbol, expiry, optionType, ratio, and tab state.

### Why now
Eliminates 10+ prop drilling paths from `App.tsx`.

### Scope
`src/store/TerminalContext.tsx`

### Files affected
`src/store/`

### Files created
`src/store/TerminalContext.tsx`

### Files moved
None

### Files modified
`src/app/providers/AppProviders.tsx`

### Dependencies
Phase 26

### Actions
1. Implement `TerminalProvider` and `useTerminal()` hook in `src/store/TerminalContext.tsx`.
2. Wrap `TerminalProvider` inside `AppProviders.tsx`.

### Import updates
Features consume `useTerminal()` to access active symbol, expiry, and ratios.

### Behavioral constraints
Switching symbol or exchange automatically selects default expiry and strike step gap.

### Verification
Switch symbol from RELIANCE to TCS; verify active symbol and expiries update in context.

### Success criteria
Terminal state updates seamlessly across all views.

### Risks
State update loops.

### Rollback
Remove `TerminalProvider`.

### Do not do
Do not decouple exchange switcher from token reset.

---

## Phase 28 — Domain Store: MarketDataContext

### Goal
Implement `MarketDataContext.tsx` to manage live contracts, spot/future prices, and ticker subscriptions.

### Why now
Decouples real-time market data feed from `App.tsx`.

### Scope
`src/store/MarketDataContext.tsx`

### Files affected
`src/store/`

### Files created
`src/store/MarketDataContext.tsx`

### Files moved
None

### Files modified
`src/app/providers/AppProviders.tsx`

### Dependencies
Phase 27

### Actions
1. Implement `MarketDataProvider` and `useMarketData()` in `src/store/MarketDataContext.tsx`.
2. Bind subscription listeners to `marketDataFeed`.
3. Wrap `MarketDataProvider` inside `AppProviders.tsx`.

### Import updates
Features consume `useMarketData()` for live quotes and metrics.

### Behavioral constraints
Streaming updates trigger at 1200ms intervals; ticks update contracts map without race conditions.

### Verification
Verify tick count and latency metrics update live in context consumer.

### Success criteria
Live tick rates match pre-refactor streaming performance.

### Risks
Excessive re-renders if map references are not memoized.

### Rollback
Remove `MarketDataProvider`.

### Do not do
Do not mutate contracts map in-place without triggering React state updates.

---

## Phase 29 — Frontend API Client Normalization

### Goal
Create centralized API client (`src/services/api/apiClient.ts`, `src/services/authApi.ts`, `src/services/marketApi.ts`, `src/services/strategyApi.ts`).

### Why now
Provides typed HTTP methods for all backend communication before backend modularization.

### Scope
`src/services/`

### Files affected
`src/services/`

### Files created
`src/services/api/apiClient.ts`, `src/services/authApi.ts`, `src/services/marketApi.ts`, `src/services/strategyApi.ts`, `src/services/index.ts`

### Files moved
None

### Files modified
`src/services/authService.ts` (delegating to `authApi`)

### Dependencies
Phase 28

### Actions
1. Implement `apiClient` with base URL `/api` and automatic `Authorization` Bearer header injection.
2. Implement typed endpoints in `authApi.ts`, `marketApi.ts`, `strategyApi.ts`.
3. Update `authService.ts` to consume `authApi.ts`.

### Import updates
Stores and features import typed API functions from `@/services`.

### Behavioral constraints
HTTP payload structures and error handling contracts remain backward compatible.

### Verification
Call `authApi.me()` and `marketApi.getStatus()`; verify successful JSON responses.

### Success criteria
API calls resolve with typed responses.

### Risks
Token header omission in protected routes.

### Rollback
Revert `src/services/`.

### Do not do
Do not change endpoint URLs.

---

## Phase 30 — Page Route & View Router Integration

### Goal
Create `AppRouter.tsx` and `MainTerminalPage.tsx` under `src/pages/terminal/` to replace conditional renders in `App.tsx`.

### Why now
Transforms `App.tsx` into a clean root component (< 50 lines).

### Scope
Create `src/pages/terminal/MainTerminalPage.tsx`, `src/app/routes/AppRouter.tsx`, refactor `src/App.tsx`.

### Files affected
`src/App.tsx`, `src/pages/terminal/MainTerminalPage.tsx`, `src/app/routes/AppRouter.tsx`

### Files created
`src/pages/terminal/MainTerminalPage.tsx`, `src/app/routes/AppRouter.tsx`, `src/app/routes/index.ts`

### Files moved
None

### Files modified
`src/App.tsx`

### Dependencies
Phase 29

### Actions
1. Implement `MainTerminalPage.tsx` assembling active view tab (`MATRIX`, `SCANNER`, `OPTION_CHAIN`, `ALL_RATIOS`) using `TerminalLayout`.
2. Implement `AppRouter.tsx` handling route switching between Landing, Auth, Terminal, Settings, and Admin.
3. Simplify `src/App.tsx` to mount `<AppRouter />`.

### Import updates
`src/App.tsx` imports `AppRouter` from `@/app/routes`.

### Behavioral constraints
All view modes (`LANDING`, `LOGIN`, `SIGNUP`, `APP`, `TERMS`, `PRIVACY`, `SETTINGS`, `ADMIN`) transition seamlessly.

### Verification
Test full navigation loop: Landing -> Login -> Terminal -> Settings Drawer -> Admin Panel -> Logout -> Landing.

### Success criteria
App navigation works identically with zero prop drilling in `App.tsx`.

### Risks
Route state desynchronization.

### Rollback
Revert `src/App.tsx` and `src/app/routes/`.

### Do not do
Do not remove authentication guard from protected terminal view.

---

## Phase 31 — Backend Architecture: Infrastructure & TOTP Engine

### Goal
Extract TOTP RFC 6238 generation and Angel One SmartAPI client into `server/infrastructure/`.

### Why now
First step in deduplicating backend logic across `server.ts` and `api/index.ts`.

### Scope
Create `server/infrastructure/totp.ts`, `server/infrastructure/angelOneClient.ts`, `server/config/credentials.ts`.

### Files affected
`server/`

### Files created
`server/config/credentials.ts`, `server/infrastructure/totp.ts`, `server/infrastructure/angelOneClient.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 30

### Actions
1. Implement `base32Decode` and `generateTOTP` in `server/infrastructure/totp.ts`.
2. Implement `AngelSessionManager` class in `server/infrastructure/angelOneClient.ts`.
3. Export preconfigured credentials from `server/config/credentials.ts`.

### Import updates
None yet.

### Behavioral constraints
TOTP algorithm must generate exact valid 6-digit Time-Based One-Time Passwords.

### Verification
Run test unit verifying TOTP generation matches RFC 6238 test vectors.

### Success criteria
Generated TOTP matches expected 6-digit output.

### Risks
Base32 decoding padding errors.

### Rollback
Delete `server/infrastructure/`.

### Do not do
Do not change HMAC SHA-1 hash mode.

---

## Phase 32 — Backend Architecture: Middleware & Shared Utilities

### Goal
Create `requireAuth` and `requireAdmin` middlewares in `server/shared/middleware/`.

### Why now
Centralizes bearer token verification and RBAC authorization for backend routes.

### Scope
Create `server/shared/middleware/requireAuth.ts`, `server/shared/middleware/requireAdmin.ts`.

### Files affected
`server/shared/`

### Files created
`server/shared/middleware/requireAuth.ts`, `server/shared/middleware/requireAdmin.ts`, `server/shared/middleware/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 31

### Actions
1. Implement `requireAuth` verifying `Authorization: Bearer <token>` against sessions store.
2. Implement `requireAdmin` verifying `req.user.role === 'ADMIN'`.

### Import updates
Backend routes consume shared middlewares.

### Behavioral constraints
Unauthorized requests receive standard 401/403 JSON payloads.

### Verification
`npm run lint`.

### Success criteria
Middleware compiles with typed Express `Request` and `Response`.

### Risks
None.

### Rollback
Delete `server/shared/middleware/`.

### Do not do
Do not allow unauthenticated access to user saved strategies or admin endpoints.

---

## Phase 33 — Backend Architecture: Auth Module

### Goal
Modularize authentication routes, controller, service, and repository under `server/modules/auth/`.

### Why now
Replaces duplicate auth code in `server.ts` and `api/index.ts`.

### Scope
Create `server/modules/auth/`.

### Files affected
`server/modules/auth/`

### Files created
`server/modules/auth/auth.routes.ts`, `server/modules/auth/auth.controller.ts`, `server/modules/auth/auth.service.ts`, `server/modules/auth/auth.repository.ts`, `server/modules/auth/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 32

### Actions
1. Implement in-memory user and session stores in `auth.repository.ts` with seeded demo accounts.
2. Implement password hashing and token generation in `auth.service.ts`.
3. Implement request handling in `auth.controller.ts`.
4. Create Express router in `auth.routes.ts`.

### Import updates
None yet.

### Behavioral constraints
Seeded passwords (`Admin123!`, `Pro123!`, `User123!`) and salt `_RATIO_SPREAD_SALT_2026` preserved.

### Verification
Run lint check; verify auth controller compiles.

### Success criteria
Auth module router handles signup, login, me, and logout.

### Risks
Password salt mismatch.

### Rollback
Delete `server/modules/auth/`.

### Do not do
Do not change user password hashing algorithm.

---

## Phase 34 — Backend Architecture: Market Data Module

### Goal
Modularize market quote and Angel One session routes under `server/modules/market/`.

### Why now
Isolates broker market data transport from business logic.

### Scope
Create `server/modules/market/`.

### Files affected
`server/modules/market/`

### Files created
`server/modules/market/market.routes.ts`, `server/modules/market/market.controller.ts`, `server/modules/market/market.service.ts`, `server/modules/market/index.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 33

### Actions
1. Implement quote batching and broker status in `market.service.ts` using `angelOneClient`.
2. Implement controller endpoints in `market.controller.ts` (`getStatus`, `getQuote`, `loginBroker`).
3. Define router in `market.routes.ts`.

### Import updates
None yet.

### Behavioral constraints
Supports exchange token separation (`nseTokens`, `nfoTokens`, `bseTokens`, `bfoTokens`).

### Verification
`npm run lint`.

### Success criteria
Market router compiles cleanly.

### Risks
None.

### Rollback
Delete `server/modules/market/`.

### Do not do
Do not mix NSE and BSE tokens in single SmartAPI request.

---

## Phase 35 — Backend Architecture: Strategies & Admin Modules

### Goal
Modularize user saved strategies and admin user management under `server/modules/strategies/` and `server/modules/admin/`.

### Why now
Completes all backend domain modules.

### Scope
Create `server/modules/strategies/` and `server/modules/admin/`.

### Files affected
`server/modules/strategies/`, `server/modules/admin/`

### Files created
`server/modules/strategies/strategy.routes.ts`, `server/modules/strategies/strategy.controller.ts`, `server/modules/strategies/strategy.service.ts`, `server/modules/strategies/strategy.repository.ts`, `server/modules/admin/admin.routes.ts`, `server/modules/admin/admin.controller.ts`, `server/modules/admin/admin.service.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 34

### Actions
1. Implement strategy CRUD repository and router in `server/modules/strategies/`.
2. Implement admin user management router in `server/modules/admin/`.

### Import updates
None yet.

### Behavioral constraints
Admin endpoints protected by `requireAdmin` middleware.

### Verification
`npm run lint`.

### Success criteria
Both module routers compile with zero errors.

### Risks
None.

### Rollback
Delete strategy and admin module folders.

### Do not do
Do not allow users to modify other users' strategies.

---

## Phase 36 — Centralized Express Application Assembly

### Goal
Assemble all backend modules into a single unified Express application under `server/app.ts`.

### Why now
Prepares single source of truth for both standalone runner and serverless function.

### Scope
Create `server/app.ts`.

### Files affected
`server/app.ts`

### Files created
`server/app.ts`

### Files moved
None

### Files modified
None

### Dependencies
Phase 35

### Actions
1. Instantiate Express app with CORS headers and JSON body parser.
2. Mount API routers:
   - `/api/auth` -> `authRouter`
   - `/api/angel` -> `marketRouter`
   - `/api/user` -> `strategyRouter`
   - `/api/admin` -> `adminRouter`
   - `/api/health` -> Health check handler
3. Also mount routers on `/` for backward compatibility.
4. Export `app`.

### Import updates
None yet.

### Behavioral constraints
All existing API endpoint paths and response structures preserved.

### Verification
`npm run lint`.

### Success criteria
Express app compiles cleanly with all routes registered.

### Risks
Route precedence conflicts.

### Rollback
Delete `server/app.ts`.

### Do not do
Do not drop `/api` prefix support.

---

## Phase 37 — Server Runner (`server.ts`) Integration

### Goal
Refactor root `server.ts` to import `server/app.ts` and handle Vite dev middleware or static dist hosting.

### Why now
Eliminates 700+ lines of duplicate monolith code in `server.ts`.

### Scope
`server.ts`

### Files affected
`server.ts`

### Files created
None

### Files moved
None

### Files modified
`server.ts`

### Dependencies
Phase 36

### Actions
1. Replace monolithic contents of `server.ts` with lightweight runner importing `app` from `./server/app`.
2. Mount Vite middleware when `NODE_ENV !== 'production'`.
3. Start listening on `PORT` (3000).

### Import updates
`server.ts` imports `app` from `./server/app`.

### Behavioral constraints
Dev server launches on port 3000; Vite HMR/middleware modes function identically.

### Verification
Restart dev server; test `/api/health`, `/api/auth/login`, and `/api/angel/status`.

### Success criteria
Dev server serves frontend and responds to API calls with 200 OK.

### Risks
Server startup port collision.

### Rollback
Revert `server.ts`.

### Do not do
Do not change server listen port (must remain 3000).

---

## Phase 38 — Serverless Function (`api/index.ts`) Integration

### Goal
Refactor `api/index.ts` to export `server/app.ts` directly for Vercel Serverless Function runtime.

### Why now
Eliminates 500+ lines of duplicate monolith code in `api/index.ts`.

### Scope
`api/index.ts`

### Files affected
`api/index.ts`

### Files created
None

### Files moved
None

### Files modified
`api/index.ts`

### Dependencies
Phase 37

### Actions
1. Replace monolithic contents of `api/index.ts` with thin export of `app` from `../server/app`.

### Import updates
`api/index.ts` imports `app` from `../server/app`.

### Behavioral constraints
Vercel serverless HTTP requests resolve identically.

### Verification
Verify TypeScript compiles `api/index.ts` without errors.

### Success criteria
`api/index.ts` compiles cleanly as an Express handler export.

### Risks
Serverless cold start timeout.

### Rollback
Revert `api/index.ts`.

### Do not do
Do not remove CORS handling in server app.

---

## Phase 39 — Cross-Stack Contract Verification

### Goal
Verify all frontend API calls connect seamlessly with modular backend routes.

### Why now
Validates end-to-end integration across all 4 main views and administrative panels.

### Scope
Frontend API clients & Backend Express controllers.

### Files affected
`src/services/*`, `server/modules/*`

### Files created
None

### Files moved
None

### Files modified
None

### Dependencies
Phase 38

### Actions
1. Test User Signup & Login with custom credentials.
2. Test Strategy Save and Delete.
3. Test Admin User Status Toggle.
4. Test Live Quote Polling and Status Check.

### Import updates
None.

### Behavioral constraints
All frontend data actions succeed with HTTP 200 responses.

### Verification
Execute manual smoke test sequence across all tabs.

### Success criteria
Zero API 404 or 500 errors in browser network panel.

### Risks
Payload serialization mismatch.

### Rollback
Identify failing route and patch controller payload mapping.

### Do not do
Do not mock responses in production paths.

---

## Phase 40 — Performance & Memoization Pass

### Goal
Audit and optimize React component memoization across `RatioMatrixSpreadsheet`, `RatioSpreadGrid`, and `PayoffChart`.

### Why now
Ensures smooth 60fps rendering during high-frequency live market ticks.

### Scope
`src/features/ratio-matrix/`, `src/features/spread-scanner/`, `src/features/payoff-analyzer/`.

### Files affected
`src/features/ratio-matrix/components/*`, `src/features/spread-scanner/components/*`

### Files created
None

### Files moved
None

### Files modified
Component files in features.

### Dependencies
Phase 39

### Actions
1. Wrap matrix row cells in `React.memo` with custom prop equality comparator.
2. Memoize payoff chart coordinate arrays.
3. Apply `tabular-nums` CSS across all dynamic numerical spans.

### Import updates
None.

### Behavioral constraints
Visual output unchanged; CPU utilization during streaming reduced.

### Verification
Profile React rendering in browser devtools during active tick simulation.

### Success criteria
No unnecessary re-renders of off-screen matrix rows.

### Risks
Over-memoization preventing timely tick flashes.

### Rollback
Revert memoization wrappers.

### Do not do
Do not disable live tick animation classes (`tick-up`, `tick-down`).

---

## Phase 41 — Automated Engine Regression Gate

### Goal
Run the full 17-test mathematical engine suite and confirm 100% pass rate.

### Why now
Guarantees mathematical integrity after all frontend and backend structural moves.

### Scope
`src/engine/engineTests.ts`

### Files affected
`src/engine/engineTests.ts`

### Files created
None

### Files moved
None

### Files modified
None

### Dependencies
Phase 40

### Actions
1. Execute `runStrategyEngineTestSuite()`.
2. Validate each test output against required criteria.

### Import updates
None.

### Behavioral constraints
All 17 tests must return `passed === true`.

### Verification
Automated test suite execution.

### Success criteria
17/17 passed.

### Risks
Mathematical regressions in payoff slope or breakeven calculation.

### Rollback
Review git diff on engine files.

### Do not do
Do not loosen test tolerance thresholds.

---

## Phase 42 — Accessibility & Keyboard Navigation Pass

### Goal
Ensure all interactive elements (matrix cells, dropdowns, modal dialogs) have proper ARIA attributes and keyboard focus management.

### Why now
Polishes production UX and accessibility compliance.

### Scope
`src/shared/components/`, `src/features/`

### Files affected
`src/shared/components/inputs/StockSelectorDropdown.tsx`, `src/features/ratio-matrix/components/MatrixCellRenderer.tsx`

### Files created
None

### Files moved
None

### Files modified
Selected UI components.

### Dependencies
Phase 41

### Actions
1. Add `aria-label`, `role="gridcell"`, `tabIndex={0}` to matrix cells.
2. Add `aria-expanded` and keyboard navigation to Stock Selector.
3. Ensure modal dialogs trap focus correctly.

### Import updates
None.

### Behavioral constraints
Visual styling unchanged; screen reader and keyboard accessibility improved.

### Verification
Navigate matrix using `Tab` and `Enter` keys.

### Success criteria
Full keyboard accessibility across primary scanner workflows.

### Risks
None.

### Rollback
Revert accessibility attributes.

### Do not do
Do not add visible focus outlines that break dark-theme aesthetic.

---

## Phase 43 — Build & Bundle Optimization

### Goal
Audit production bundle size and configure Vite manual chunks for optimal code splitting.

### Why now
Optimizes production delivery before final cleanup.

### Scope
`vite.config.ts`

### Files affected
`vite.config.ts`

### Files created
None

### Files moved
None

### Files modified
`vite.config.ts`

### Dependencies
Phase 42

### Actions
1. Configure Vite `build.rollupOptions.output.manualChunks` splitting large vendor libraries (`antd`, `@ant-design/icons`, `motion`) from application code.
2. Run `npm run build` and inspect chunk sizes.

### Import updates
None.

### Behavioral constraints
Application production bundle builds cleanly.

### Verification
Run `npm run build` and verify all chunk sizes are within recommended limits.

### Success criteria
`npm run build` succeeds without warnings.

### Risks
Vendor chunk initialization order issues.

### Rollback
Revert `vite.config.ts` rollup options.

### Do not do
Do not split critical CSS into blocking sub-bundles.

---

## Phase 44 — Dead-Code & Bridge Cleanup

### Goal
Remove deprecated legacy bridge files in `src/components/` and `src/pages/` that were preserved during intermediate migration phases.

### Why now
The final architecture has stabilized; all active imports now use target paths (`@/features/*`, `@/shared/*`, `@/pages/*`).

### Scope
Remove obsolete bridge files in `src/components/` and `src/pages/`.

### Files affected
Legacy compatibility bridge files in `src/components/` and `src/pages/`.

### Files created
None

### Files moved
None

### Files modified
None

### Dependencies
Phase 43

### Actions
1. Search codebase for any remaining imports referencing legacy bridge files.
2. Safely remove obsolete bridge files.
3. Run `npm run lint` and `npm run build` to verify zero dangling imports.

### Import updates
Ensure all imports use standardized aliases.

### Behavioral constraints
Zero broken imports across entire repository.

### Verification
Run `npm run lint` -> confirm 0 errors.

### Success criteria
Clean directory tree with 0 dead or duplicate files.

### Risks
Accidental deletion of active file.

### Rollback
Restore deleted bridge files.

### Do not do
Do not delete files in `src/data/` or `src/engine/`.

---

## Phase 45 — Final Architecture Verification & Documentation Sign-Off

### Goal
Perform complete regression checklist, update progress tracker to 100% `VERIFIED`, and finalize architecture documentation.

### Why now
Final phase sealing the refactoring migration.

### Scope
`docs/refactor/19-refactor-progress.md`, `docs/refactor/16-verification-checklist.md`.

### Files affected
`docs/refactor/19-refactor-progress.md`

### Files created
None

### Files moved
None

### Files modified
`docs/refactor/19-refactor-progress.md`

### Dependencies
Phase 01 through Phase 44

### Actions
1. Run `npx tsc --noEmit`.
2. Run `npm run build`.
3. Run `runStrategyEngineTestSuite()` (17/17 pass).
4. Mark all 45 phases as `COMPLETE` and `VERIFIED` in `19-refactor-progress.md`.

### Import updates
None.

### Behavioral constraints
Entire full-stack application operates with production stability, zero bugs, and clean modular code.

### Verification
Final end-to-end smoke test on dev server.

### Success criteria
All 45 phases verified; build succeeds; engine tests pass 100%.

### Risks
None.

### Rollback
N/A.

### Do not do
Do not perform unverified manual edits after final sign-off.
