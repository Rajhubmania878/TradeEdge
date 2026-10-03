# 20 — Architectural Decisions Log (ADRs)

This log records definitive architectural decisions to prevent future engineering turns or AI agents from reversing approved patterns.

---

## ADR-001 — Preservation of Financial Calculation Engines

- **Context**: The repository contains precision financial calculation engines (`src/engine/blackScholes.ts`, `src/engine/payoffEngine.ts`, `src/engine/oiTracker.ts`) tested against 17 specific edge cases.
- **Decision**: Keep calculation functions pure, synchronous, and mathematically unaltered. Never refactor their internal equations to match generic libraries.
- **Reason**: Numerical rounding, asymptotic slope analysis for unlimited loss detection, and piecewise linear breakeven solvers must remain exact.
- **Alternatives**: Replacing with generic NPM options libraries (rejected: lack NSE/BSE specific contract multiplication, asymmetric ratio support, and Indian rupee formatting).
- **Tradeoffs**: Requires maintaining custom calculation algorithms.
- **Affected Areas**: `src/engine/*`, `src/features/payoff-analyzer/`, `src/features/ratio-matrix/`.

---

## ADR-002 — Unified Backend Core (`server/app.ts`) for Express and Serverless

- **Context**: `server.ts` (743 lines) and `api/index.ts` (534 lines) had duplicate implementations of auth, quote proxying, TOTP generation, and in-memory databases.
- **Decision**: Extract all Express routing, middleware, and controllers into `server/app.ts`. Have `server.ts` act only as local Node runner and `api/index.ts` act only as the Vercel serverless export.
- **Reason**: Guarantees zero code duplication and 100% parity between local development and Vercel production deployments.
- **Alternatives**: Maintaining separate codebases (rejected: bug fixes required in two places).
- **Tradeoffs**: Requires clean separation between Express routing and Node server listener.
- **Affected Areas**: `server.ts`, `api/index.ts`, `server/*`.

---

## ADR-003 — Domain Feature Isolation (`src/features/*`)

- **Context**: All 16 components were previously in a flat directory (`src/components/`).
- **Decision**: Group components, feature hooks, sub-renderers, and sub-types under feature directories (`ratio-matrix`, `spread-scanner`, `option-chain`, `all-ratios`, `payoff-analyzer`, `market-feed`, `user-strategies`).
- **Reason**: Enforces clear ownership, prevents cross-feature coupling, and keeps individual file sizes < 250 lines.
- **Alternatives**: Layer-based grouping (all tables in `tables/`, all toolbars in `toolbars/`) (rejected: scatters related feature logic).
- **Tradeoffs**: Deeper directory nesting.
- **Affected Areas**: `src/features/*`, `src/components/*`.

---

## ADR-004 — Phased Deferral of Code Deletions

- **Context**: Deleting files during early refactoring phases causes broken imports and build failures in dependent files.
- **Decision**: When moving files, keep temporary re-export bridge files in place until Phase 44 (Dead-Code Cleanup).
- **Reason**: Ensures the application continuously compiles and tests remain executable at every single step of the migration.
- **Alternatives**: Immediate deletion on move (rejected: causes widespread cascading import errors).
- **Tradeoffs**: Temporary presence of small bridge files during intermediate phases.
- **Affected Areas**: Entire repository.

---

## ADR-005 — Context API for Domain State Management

- **Context**: `App.tsx` managed 26+ state variables and drilled them through 4 layers of components.
- **Decision**: Use React Context (`AuthContext`, `TerminalContext`, `MarketDataContext`) instead of adding heavy external global state libraries like Redux or Zustand.
- **Reason**: The existing codebase is already well-suited for React 19 Context; avoids adding extra NPM dependencies while completely resolving prop drilling.
- **Alternatives**: Redux Toolkit, Zustand (rejected: unnecessary dependency overhead for current architecture).
- **Tradeoffs**: Requires careful memoization of context values to prevent unnecessary re-renders during high-frequency ticks.
- **Affected Areas**: `src/store/*`, `src/app/providers/*`, `src/App.tsx`.

---

## ADR-006 — Ant Design Pro Layout Architecture (`@ant-design/pro-components`)

- **Context**: The terminal interface required an institutional-grade layout, aligned navigation flow, and consistent spacing/padding/margin standards adhering to Ant Design principles (Natural, Certain, Meaningful, Growing).
- **Decision**: Implement `TerminalLayout` powered by Ant Design Pro `ProLayout` (top navigation mode) and `PageContainer`, paired with `ProCard` containers across feature control panels and data displays (`StrategyControlBar`, `MarketSnapshotStrip`, `ControlsPanel`, and main spreadsheet views).
- **Reason**: Standardizes layout hierarchy, breadcrumb routing, header action toolbars, asset context switches (NSE/BSE, stock, expiry), and card elevations with balanced 12px/16px gutters and zero layout clipping.
- **Alternatives**: Custom Tailwind flex/grid containers (rejected: inconsistent margins, padding drift across breakpoints).
- **Tradeoffs**: Relies on `@ant-design/pro-components` ProLayout tokens and lifecycle.
- **Affected Areas**: `src/app/layouts/TerminalLayout.tsx`, `src/pages/terminal/MainTerminalPage.tsx`, `src/features/ratio-matrix/components/StrategyControlBar.tsx`, `src/features/market-feed/components/MarketSnapshotStrip.tsx`, `src/features/spread-scanner/components/ControlsPanel.tsx`.


