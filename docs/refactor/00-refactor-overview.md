# 00 — Architectural Refactoring Overview

## 1. Executive Summary

This document presents a production-grade refactoring blueprint for the **NSE & BSE Equity Options Ratio Spread Scanner**. The application is a full-stack financial terminal providing real-time options scanning, Black-Scholes Greeks analysis, ratio matrix visualization, multi-leg risk payoff curves, and authenticated strategy management.

| Parameter | Current Assessment |
| :--- | :--- |
| **Current Architectural Style** | Monolithic hybrid (Single-file Express/Vercel server + Flat component directory + God-component `App.tsx`) |
| **Target Architectural Style** | Modular, feature-driven architecture with clean separation of domain logic, state, presentation, API transport, and server modules |
| **Total Identified Issues** | **38 architectural & maintainability defects** |
| **Estimated Architectural Complexity** | **Medium-High** (due to real-time market data streaming, multi-leg mathematical engine precision, and dual backend transport) |
| **Planned Migration Phases** | **45 strictly ordered, independently verifiable phases** |
| **Safety Guarantees** | Zero-downtime migration, zero behavioral drift, backward-compatible API contracts, 17 automated engine test checkpoints |

---

## 2. Major Architectural Deficiencies

1. **God Component (`src/App.tsx` - 1,003 lines)**:
   - Holds 26+ distinct state variables (auth, routing, strategy parameters, streaming contracts, presets, UI toggles).
   - Directly executes options strike math, multi-leg strategy generation, and filtering inside `useMemo` blocks.
   - Embeds 6 full pages/drawers as conditional renders rather than decoupled route modules.

2. **Duplicated Backend Logic (`server.ts` - 743 lines vs `api/index.ts` - 534 lines)**:
   - Identical TOTP generators, Base32 decoders, `AngelSessionManager` classes, in-memory user maps, and quote handlers are copy-pasted across both files.
   - Any bug fix or security patch must be manually synchronized in two places.

3. **Flat and Oversized Component Directory (`src/components/` - 16 files)**:
   - Domain-specific features (Ratio Matrix, Option Chain, Scanner Grid), shared UI elements (Header, Status Bar, Dropdown), and overlays (Modals, Drawers) are co-located in a single flat directory with no feature boundary or isolation.

4. **Service & State Leakage (`src/services/marketDataFeed.ts` - 716 lines)**:
   - The market data service manages WebSocket/REST polling, mock tick generation, Greek re-calculations, DOM visibility listeners, and token registry caching in one class.

5. **Weak Path Resolution & Deep Relative Imports**:
   - `tsconfig.json` has `@/* -> ./*` mapped to root rather than `@/src/*` or specific domain aliases (`@/features/*`, `@/shared/*`, `@/engine/*`).
   - Components rely heavily on relative imports like `../../data/universeManager`.

6. **Hardcoded Demo State & Fragile In-Memory Persistence**:
   - Authentication services hardcode demo user hashes in frontend storage and server memory without centralized repository abstraction.

---

## 3. Target Architectural Vision

```
project/
├── backend/                  # Decoupled Express & Serverless API
│   ├── config/               # Environment & credentials config
│   ├── infrastructure/       # External Angel One SmartAPI client, TOTP engine
│   ├── modules/
│   │   ├── auth/             # Auth routes, controller, service, repository
│   │   ├── market/           # Quotes, status, exchange data routes & services
│   │   ├── strategies/       # User saved strategies CRUD
│   │   └── admin/            # User role & plan management
│   ├── shared/               # Middleware (auth, admin, error-handler)
│   └── app.ts                # App initialization (shared by server.ts & api/index.ts)
│
├── src/                      # Frontend SPA Architecture
│   ├── app/                  # App bootstrap, providers, root layouts, router
│   ├── pages/                # Route-level view composition (Landing, Auth, Terminal, Admin)
│   ├── features/             # Isolated Domain Features
│   │   ├── ratio-matrix/     # Spreadsheet grid, strike matrix cells, gap validation
│   │   ├── spread-scanner/   # Scanner controls, filtering toolbar, ratio spread grid
│   │   ├── option-chain/     # Dual-view Call/Put option chain
│   │   ├── all-ratios/       # Comparative 1:1, 1:2, 1:3, 2:3 ratio table
│   │   ├── payoff-analyzer/  # Risk curves, breakeven badges, max profit/loss cards
│   │   ├── market-feed/      # Snapshot strip, streaming ticker, Angel One modal
│   │   └── user-strategies/  # Saved presets drawer, preset loader
│   ├── shared/               # Reusable UI & Utilities
│   │   ├── components/       # HeaderBar, StatusBar, Dropdowns, Badges, Modals
│   │   ├── hooks/            # useDebounce, useMediaQuery, useLocalStorage
│   │   ├── utils/            # Number formatters, currency, date helpers
│   │   └── types/            # Common domain types
│   ├── engine/               # Quantitative Core (Black-Scholes, Payoff, OI Tracker)
│   ├── data/                 # Market Universes (NSE, BSE, Universe Manager)
│   ├── services/             # Normalized Frontend API Clients
│   ├── store/                # Domain & UI State Stores (Context/Hooks)
│   └── styles/               # Design tokens, CSS variables, typography
```

---

## 4. Highest-Risk Migration Areas

| Area | Risk Level | Mitigation Strategy |
| :--- | :---: | :--- |
| **Quantitative Payoff & Breakeven Engine** | **CRITICAL** | Keep `src/engine/` algorithms intact; run `engineTests.ts` (17 tests) after every single phase touching engine or calculation types. |
| **Market Data Streaming & Feed Token Lifecycle** | **HIGH** | Normalize `marketDataFeed.ts` interfaces with adapter wrappers before breaking apart simulation and live polling subsystems. |
| **Dual Backend Runtime (`server.ts` & `api/index.ts`)** | **HIGH** | Extract shared backend modules into `server/` first without modifying runtime entry points; verify both local Express and Vercel handler compile. |
| **App.tsx State & Routing Decomposition** | **MEDIUM** | Extract state into domain-specific hooks and context providers sequentially before splitting the root render tree. |
| **Exchange Strike Universe Resolution** | **MEDIUM** | Preserve exact token resolution signatures in `universeManager.ts` to prevent token mismatch between NSE and BSE. |

---

## 5. Areas That Must NOT Be Changed Initially

1. **Mathematical Equations**: Black-Scholes formula, implied volatility Newton-Raphson solver, and piecewise linear breakeven algorithms.
2. **Angel One SmartAPI Authentication Schema**: The TOTP RFC 6238 generation parameters, HMAC SHA-1 base32 decoding logic, and SmartAPI HTTP headers.
3. **JSON Instrument Universe Files**: `angelInstrumentsMap.json`, `bseCashUniverse.json`, `bseInstrumentsMap.json`, `angelUnderlyings.json`, `bseUnderlyings.json`.
4. **Tailwind & Ant Design Color Tokens**: Semantic variables in `src/index.css` and `src/main.tsx` until the dedicated Design System phase.

---

## 6. Recommended Execution Order

```
Phase 01–05:  Baselines & Dependency Safeguards (Tests, Config, Aliases)
Phase 06–13:  Shared Foundations & Design System (Tokens, Primitives, Utilities)
Phase 14–20:  Application Shell, Providers & Layout Architecture
Phase 21–28:  Feature Extraction & Component Ownership (Matrix, Scanner, Payoff, Chain)
Phase 29–32:  State Management & Frontend API Normalization
Phase 33–41:  Backend Modularization & Server Shared Core
Phase 42–45:  Testing, Performance Optimization, Cleanup & Final Audit
```
