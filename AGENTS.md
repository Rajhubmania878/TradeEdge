# AGENTS.md — Implementation Instructions for AI & Engineering Agents

This document defines the strict operating rules, phase workflow, safety protocols, and context boundary requirements for all future AI agents and engineers executing refactoring phases on this repository.

---

## 1. Context Efficiency Rules

To maximize reliability and reduce context window exhaustion, **DO NOT re-read the entire repository** when assigned to implement a specific phase.

### What to Read:
1. `AGENTS.md` (this file)
2. `docs/refactor/00-refactor-overview.md`
3. `docs/refactor/20-decisions-log.md`
4. The specific Phase definition in `docs/refactor/15-migration-phases.md` (e.g., "Phase 12 — Shared Utilities")
5. Only the specific source and target files listed under `Files affected`, `Files created`, or `Files moved` for that phase.

---

## 2. Core Execution Protocol

Every phase must follow the **11-Step Safe Execution Cycle**:

```
[1] Inspect Source Files Listed in Phase
                     ↓
[2] Check Existing Consumers & Imports
                     ↓
[3] Create Target Directory Structure (if needed)
                     ↓
[4] Move / Create Target File (Zero logic rewrite)
                     ↓
[5] Update Import Paths Across Dependents
                     ↓
[6] Run Typecheck (`npm run lint` or `npx tsc --noEmit`)
                     ↓
[7] Run Engine Test Suite (`src/engine/engineTests.ts`)
                     ↓
[8] Verify Dev Server Compilation (`compile_applet`)
                     ↓
[9] Perform Phase-Specific Manual & Smoke Verifications
                     ↓
[10] Update Progress Status in `docs/refactor/19-refactor-progress.md`
                     ↓
[11] Checkpoint Phase
```

---

## 3. Strict Safety Boundaries

1. **Zero Behavioral Drift**: Do NOT change business logic, calculation formulas, or user interactions while performing file moves or directory restructuring.
2. **Move Before Modify**: Always move a file to its target location with updated imports and verify it compiles BEFORE refactoring its internals.
3. **No Uncontrolled Contract Changes**: Never alter backend API endpoints and frontend callers simultaneously without maintaining backward compatibility or explicit contract deprecation steps.
4. **Single-Phase Isolation**: Never start Phase N+1 before Phase N is marked `COMPLETE` and `VERIFIED` in `docs/refactor/19-refactor-progress.md`.
5. **No Speculative Deletions**: Never delete files prematurely. All cleanup of obsolete barrel exports or dead files is strictly deferred to Phase 44 (Dead-Code Cleanup).
6. **Preserve Financial Engine Precision**: Under no circumstances should `src/engine/payoffEngine.ts` or `src/engine/blackScholes.ts` mathematical models, rounding factors, or edge-case asymptotes be simplified or altered without passing all 17 tests in `engineTests.ts`.

---

## 4. Phase Status Definitions

In `docs/refactor/19-refactor-progress.md`, update status using these exact values:
- `NOT STARTED`: Phase has not been initiated.
- `IN PROGRESS`: Work is actively ongoing for this phase.
- `BLOCKED`: Blocked by an unresolved dependency, unexpected error, or failed verification.
- `COMPLETE`: Code moves, import updates, and types are finished.
- `VERIFIED`: Passed compilation, typecheck, unit tests, and smoke checklist.

---

## 5. Rollback Trigger

If any of the following occur during phase implementation and cannot be resolved in ≤ 2 small fix attempts:
1. `npm run lint` / `tsc --noEmit` produces unresolvable circular dependency or type errors.
2. Any test in `runStrategyEngineTestSuite()` fails.
3. Application UI breaks on start.

**Action**: Immediately execute the rollback procedure specified in `docs/refactor/17-rollback-strategy.md` for that specific phase.

---

## 6. Performance Engineering Protocols

To maintain high responsiveness (60 FPS) and avoid thread congestion during real-time market feeds:

1. **RAF Micro-Tick Batching**:
   - High-frequency market quote ticks must always be batched using `requestAnimationFrame` before triggering React state updates in `MarketDataContext`.
   - Never dispatch raw WebSocket/polling state updates to top-level context without batching.

2. **Scoped Context Mounting & Zero Idle Resource Overhead**:
   - Streaming contexts (`MarketDataProvider`, `TerminalProvider`) must ONLY mount when the user is inside the authenticated terminal workspace (`viewMode === 'APP'`).
   - Never wrap top-level root providers (e.g. `AppProviders`) with streaming contexts; Landing, Login, Signup, and Legal pages must remain completely free of market data polling and tick loops.
   - Background feeds (`marketDataFeed`) must guard polling and simulation routines: if `tickCallbacks.size === 0`, all tick math, quote fetching, and connection supervisor probes must remain completely idle (0% CPU, 0 network requests).

3. **Lazy Mathematical Simulations**:
   - Heavy 120-step root-finding breakeven calculations and 80-point payoff chart curve generation (`evaluateStrategyPayoff`) must only run on-demand (when a strategy or cell is actively clicked or selected), never eagerly inside large grid loops ($>50$ cells).

4. **Active Tab Computational Guards**:
   - Any multi-strike spread generation or comparative strategy calculations must guard on the active view tab (e.g. `if (activeTab !== 'SCANNER') return [];`) so inactive tabs consume 0% background CPU.

5. **$O(1)$ Strike-Indexed Contract Lookups**:
   - Never iterate linearly (`O(N)`) over contract maps inside cell/row renderers. Always build or use direct `$token` or `${strike}-${optionType}` keyed maps.

6. **Code-Splitting for Heavy Views & Sub-Panels**:
   - Modals, drawers, and administrative consoles (`AngelOneModal`, `UnitTestsModal`, `SettingsPage`, `AdminPage`, `PayoffChart`) must be lazy loaded via `React.lazy()` and wrapped in `Suspense`.
   - Secondary tab views and sub-panels (e.g. `OptionChainDualView`, `AllRatiosScanner`, `ControlsPanel`, `FilterToolbar`, `RatioSpreadGrid`) must be code-split so the default `RatioMatrixSpreadsheet` renders instantaneously on initial terminal entry.

7. **Dropdown & Filter Lazy Evaluation**:
   - Large stock universe search loops (e.g. 2,000+ BSE cash equities) must be guarded with `if (!isOpen) return [];` so closed menus consume zero CPU during standard navigation and market updates.

8. **Analytical $O(1)$ Spread Calculations in Matrix Scanners**:
   - For multi-ratio comparative grids (e.g. `AllRatiosScanner`), calculate peak profit, break-even targets, and risk bounds using $O(1)$ analytical ratio spread formulas, reserving full 80-point chart generation for on-demand user clicks.

---

## 7. Icon System & UI Visual Standards

To preserve visual coherence, recognizability, and alignment with the Ant Design design system:

1. **Unified `@ant-design/icons` Standard**:
   - All icons across buttons, tables, toolbars, cards, badges, and navigation must use `@ant-design/icons` (preferring the `Outlined` variant for general actions and states).
   - Do NOT mix third-party icon libraries (e.g. `lucide-react`, inline SVG paths) into application components.

2. **Semantic Icon Color Mapping**:
   - **Credit / Bullish**: `text-emerald-600 dark:text-emerald-400` with `<RiseOutlined />`
   - **Debit / Bearish**: `text-amber-600 dark:text-amber-400` or `text-rose-600 dark:text-rose-400` with `<FallOutlined />`
   - **Informational / Brand Action**: `@ant-design/colors` blue tokens (`blue.primary`)
   - **System Secondary**: `text-slate-400 dark:text-slate-500`

3. **Accessibility & Optical Sizing**:
   - Inline action icons: 12px–14px (`text-xs` / `text-sm`).
   - Toolbar and navigation icons: 16px–18px (`text-base`).
   - Modal and empty state icons: 24px–32px.
   - All icon-only buttons must provide an explicit `aria-label` and Ant Design `<Tooltip title="...">`.



