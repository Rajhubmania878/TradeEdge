# 04 — File Migration Map

This table maps every meaningful file in the repository from its current location to its target architecture location, along with reason, affected dependencies, imports, risk, and migration phase.

| Current Path | Target Path | Reason | Dependencies Affected | Imports Affected | Risk | Phase |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `src/context/ThemeContext.tsx` | `src/app/providers/ThemeProvider.tsx` | Standardize under app providers | `main.tsx`, `HeaderBar.tsx` | `@/context/ThemeContext` -> `@/app/providers/ThemeProvider` | Low | 18 |
| `src/components/HeaderBar.tsx` | `src/shared/components/navigation/HeaderBar.tsx` | Reusable top navigation shell | `App.tsx` | `@/components/HeaderBar` -> `@/shared/components/navigation/HeaderBar` | Low | 17 |
| `src/components/StatusBar.tsx` | `src/shared/components/feedback/StatusBar.tsx` | Reusable bottom telemetry status bar | `App.tsx` | `@/components/StatusBar` -> `@/shared/components/feedback/StatusBar` | Low | 16 |
| `src/components/StockSelectorDropdown.tsx` | `src/shared/components/inputs/StockSelectorDropdown.tsx` | Reusable exchange/symbol selector | `HeaderBar.tsx`, `ControlsPanel.tsx` | `@/components/StockSelectorDropdown` -> `@/shared/components/inputs/StockSelectorDropdown` | Low | 15 |
| `src/components/RatioMatrixSpreadsheet.tsx` | `src/features/ratio-matrix/components/RatioMatrixSpreadsheet.tsx` | Domain feature encapsulation | `App.tsx` | `@/components/RatioMatrixSpreadsheet` -> `@/features/ratio-matrix` | Medium | 22 |
| `src/components/StrategyControlBar.tsx` | `src/features/ratio-matrix/components/StrategyControlBar.tsx` | Matrix toolbar encapsulation | `App.tsx` | `@/components/StrategyControlBar` -> `@/features/ratio-matrix` | Low | 22 |
| `src/components/ControlsPanel.tsx` | `src/features/spread-scanner/components/ControlsPanel.tsx` | Scanner controls encapsulation | `App.tsx` | `@/components/ControlsPanel` -> `@/features/spread-scanner` | Low | 23 |
| `src/components/FilterToolbar.tsx` | `src/features/spread-scanner/components/FilterToolbar.tsx` | Scanner filter encapsulation | `App.tsx` | `@/components/FilterToolbar` -> `@/features/spread-scanner` | Low | 23 |
| `src/components/RatioSpreadGrid.tsx` | `src/features/spread-scanner/components/RatioSpreadGrid.tsx` | Scanner grid encapsulation | `App.tsx` | `@/components/RatioSpreadGrid` -> `@/features/spread-scanner` | Low | 23 |
| `src/components/OptionChainDualView.tsx` | `src/features/option-chain/components/OptionChainDualView.tsx` | Option chain feature encapsulation | `App.tsx` | `@/components/OptionChainDualView` -> `@/features/option-chain` | Low | 24 |
| `src/components/AllRatiosScanner.tsx` | `src/features/all-ratios/components/AllRatiosScanner.tsx` | Comparative ratio scanner feature | `App.tsx` | `@/components/AllRatiosScanner` -> `@/features/all-ratios` | Low | 24 |
| `src/components/PayoffChart.tsx` | `src/features/payoff-analyzer/components/PayoffChart.tsx` | Payoff visualization feature | `SelectedStrategyPanel.tsx`, `StrategyDetailDrawer.tsx` | `@/components/PayoffChart` -> `@/features/payoff-analyzer` | Low | 25 |
| `src/components/SelectedStrategyPanel.tsx` | `src/features/user-strategies/components/SelectedStrategyPanel.tsx` | Selected strategy panel feature | `App.tsx` | `@/components/SelectedStrategyPanel` -> `@/features/user-strategies` | Low | 25 |
| `src/components/StrategyDetailDrawer.tsx` | `src/features/user-strategies/components/StrategyDetailDrawer.tsx` | Strategy detail drawer feature | `RatioMatrixSpreadsheet.tsx`, `RatioSpreadGrid.tsx` | `@/components/StrategyDetailDrawer` -> `@/features/user-strategies` | Low | 25 |
| `src/components/AngelOneModal.tsx` | `src/features/market-feed/components/AngelOneModal.tsx` | Market feed settings modal | `App.tsx` | `@/components/AngelOneModal` -> `@/features/market-feed` | Low | 26 |
| `src/components/MarketSnapshotStrip.tsx` | `src/features/market-feed/components/MarketSnapshotStrip.tsx` | Market snapshot strip | `App.tsx` | `@/components/MarketSnapshotStrip` -> `@/features/market-feed` | Low | 26 |
| `src/components/UnitTestsModal.tsx` | `src/shared/components/feedback/UnitTestsModal.tsx` | Test suite runner modal | `App.tsx` | `@/components/UnitTestsModal` -> `@/shared/components/feedback/UnitTestsModal` | Low | 16 |
| `src/pages/LandingPage.tsx` | `src/pages/landing/LandingPage.tsx` | Route page structure | `App.tsx` | `@/pages/LandingPage` -> `@/pages/landing/LandingPage` | Low | 21 |
| `src/pages/LoginPage.tsx` | `src/pages/auth/LoginPage.tsx` | Auth route page | `App.tsx` | `@/pages/LoginPage` -> `@/pages/auth/LoginPage` | Low | 21 |
| `src/pages/SignupPage.tsx` | `src/pages/auth/SignupPage.tsx` | Auth route page | `App.tsx` | `@/pages/SignupPage` -> `@/pages/auth/SignupPage` | Low | 21 |
| `src/pages/ForgotPasswordPage.tsx` | `src/pages/auth/ForgotPasswordPage.tsx` | Auth route page | `App.tsx` | `@/pages/ForgotPasswordPage` -> `@/pages/auth/ForgotPasswordPage` | Low | 21 |
| `src/pages/TermsPage.tsx` | `src/pages/auth/TermsPage.tsx` | Terms & Privacy route page | `App.tsx` | `@/pages/TermsPage` -> `@/pages/auth/TermsPage` | Low | 21 |
| `src/pages/SettingsPage.tsx` | `src/pages/settings/SettingsPage.tsx` | Settings page | `App.tsx` | `@/pages/SettingsPage` -> `@/pages/settings/SettingsPage` | Low | 21 |
| `src/pages/AdminPage.tsx` | `src/pages/admin/AdminPage.tsx` | Admin management page | `App.tsx` | `@/pages/AdminPage` -> `@/pages/admin/AdminPage` | Low | 21 |
| `src/services/authService.ts` | `src/services/authApi.ts` & `src/store/AuthContext.tsx` | Split HTTP client from state store | `App.tsx`, pages | `@/services/authService` -> `@/services/authApi` | Medium | 31 |
| `src/services/marketDataFeed.ts` | `src/features/market-feed/services/marketDataFeed.ts` | Feature service scoping | `App.tsx`, components | `@/services/marketDataFeed` -> `@/features/market-feed/services` | Medium | 31 |
| `server.ts` & `api/index.ts` (Core Logic) | `server/app.ts`, `server/modules/*` | Backend modularization & deduplication | Express runner, Vercel handler | Root handlers import from `server/app.ts` | High | 33–38 |

---

*Note: Files in `src/engine/` (`blackScholes.ts`, `payoffEngine.ts`, `oiTracker.ts`, `engineTests.ts`) and `src/data/` (`nseUniverse.ts`, `bseUniverse.ts`, `universeManager.ts`, JSON files) remain in their canonical directories to avoid breaking mathematical imports and instrument dictionaries.*
