# 02 — Target Architecture Specification

## 1. Directory Structure

```
project/
├── public/                       # Static public assets (favicons, robots.txt)
├── server/                       # Backend Express & API Modules
│   ├── app.ts                    # Core Express app configuration & middleware
│   ├── config/                   # Server environment & broker credentials config
│   ├── infrastructure/           # Angel One SmartAPI client, TOTP generator
│   ├── modules/
│   │   ├── auth/                 # Auth controller, service, repository, routes
│   │   ├── market/               # Quotes, status, exchange routes & service
│   │   ├── strategies/           # Saved strategies CRUD routes & service
│   │   └── admin/                # Admin user management routes & service
│   └── shared/                   # Auth middleware, admin guard, error handler
│
├── src/                          # Frontend Application
│   ├── app/                      # Bootstrap, root providers, routing, layouts
│   │   ├── providers/            # ThemeProvider, AntdConfigProvider, AuthProvider
│   │   ├── routes/               # AppRoutes, RouteGuard, ViewRouter
│   │   ├── layouts/              # TerminalLayout, AuthLayout, PageContainer
│   │   └── App.tsx               # Pure root component mounting providers & routes
│   │
│   ├── pages/                    # Route-level page composition
│   │   ├── landing/              # LandingPage
│   │   ├── auth/                 # LoginPage, SignupPage, ForgotPasswordPage, TermsPage
│   │   ├── terminal/             # MainTerminalPage (orchestrating features)
│   │   ├── settings/             # SettingsPage
│   │   └── admin/                # AdminPage
│   │
│   ├── features/                 # Domain-Specific Feature Modules
│   │   ├── ratio-matrix/         # Ratio matrix spreadsheet, strike row, cell renderers
│   │   ├── spread-scanner/       # Ratio spread grid, scanner controls, filter toolbar
│   │   ├── option-chain/         # Dual view option chain table & strike selector
│   │   ├── all-ratios/           # Comparative multi-ratio scanner table
│   │   ├── payoff-analyzer/      # Payoff chart, risk stats, breakeven pills
│   │   ├── market-feed/          # Snapshot strip, Angel One connection modal, status pill
│   │   └── user-strategies/      # Selected strategy drawer, preset manager, save modal
│   │
│   ├── shared/                   # Domain-Agnostic Reusable Units
│   │   ├── components/           # HeaderBar, StatusBar, StockSelector, Dropdown, Modal
│   │   ├── hooks/                # useDebounce, useLocalStorage, useFullscreen
│   │   ├── utils/                # formatters, math, date, cn class helper
│   │   └── types/                # Core shared primitive types
│   │
│   ├── engine/                   # Quantitative Calculations (Pure domain logic)
│   │   ├── blackScholes.ts       # Black-Scholes pricing, IV solver, Greeks
│   │   ├── payoffEngine.ts       # Multi-leg payoff curves, breakeven solver, risk bounds
│   │   ├── oiTracker.ts          # Open interest tracking & delta calculations
│   │   └── engineTests.ts        # Automated regression test suite
│   │
│   ├── data/                     # Market Universe Dictionaries
│   │   ├── nseUniverse.ts        # NSE equity options universe
│   │   ├── bseUniverse.ts        # BSE equity options & cash universe
│   │   └── universeManager.ts    # Unified exchange-aware universe facade
│   │
│   ├── services/                 # API Clients & HTTP Transports
│   │   ├── api/                  # Base API client (fetch wrapper with interceptors)
│   │   ├── authApi.ts            # Auth & session endpoints
│   │   ├── marketApi.ts          # Angel One quote & status endpoints
│   │   └── strategyApi.ts        # Saved strategies endpoints
│   │
│   ├── store/                    # Domain State Management
│   │   ├── TerminalContext.tsx   # Active exchange, symbol, expiry, ratio state
│   │   ├── MarketDataContext.tsx # Live contracts, spot, future price, metrics
│   │   └── AuthContext.tsx       # Current user, session token, login/logout
│   │
│   ├── styles/                   # Design Tokens & Styles
│   │   ├── tokens.css            # Color, typography, spacing CSS variables
│   │   ├── themeConfig.ts        # Ant Design light/dark theme tokens
│   │   └── index.css             # Tailwind v4 directives and base resets
│   │
│   └── main.tsx                  # Clean entry point
│
├── api/
│   └── index.ts                  # Thin Vercel serverless adapter importing server/app.ts
├── server.ts                     # Thin Node.js dev/prod runner importing server/app.ts
└── docs/refactor/                # Refactoring Documentation
```

---

## 2. Directory Responsibilities & Rules

### `src/app/`
- **Allowed**: Providers, root router, top-level layout wrappers, error boundaries.
- **Forbidden**: Domain calculations, direct API fetch calls, hardcoded business forms.
- **Dependencies**: Can depend on `pages/`, `features/`, `shared/`, `store/`, `styles/`.

### `src/pages/`
- **Allowed**: Assembling features and layouts for a specific route/view.
- **Forbidden**: Re-implementing spreadsheet grids, calculation math, or duplicate state machines.
- **Dependencies**: Can depend on `features/`, `shared/`, `store/`, `services/`.

### `src/features/{feature-name}/`
- **Allowed**: Feature components, feature hooks, feature sub-types, feature utilities.
- **Forbidden**: Directly importing private internal files of another feature. Cross-feature interaction must go through shared services, stores, or public feature index exports.
- **Dependencies**: Can depend on `shared/`, `engine/`, `data/`, `services/`, `store/`.

### `src/shared/`
- **Allowed**: Highly reusable UI primitives (buttons, badges, headers, modals), generic utility functions, custom generic hooks.
- **Forbidden**: Any import from `features/`, `pages/`, or `app/`. No business domain logic.
- **Dependencies**: Leaf node. Only standard libraries and shared types.

### `src/engine/`
- **Allowed**: Pure mathematical functions, option pricing algorithms, test cases.
- **Forbidden**: DOM references, React hooks, API calls, browser storage access.
- **Dependencies**: Pure TypeScript.

---

## 3. Dependency Flow Graph

```
src/main.tsx
    ↓
src/app/ (Providers, Layouts, Routes)
    ↓
src/pages/ (Route views)
    ↓
src/features/ (Domain widgets & workflows)
    ↓
src/store/ & src/services/ (State & API transport)
    ↓
src/engine/ & src/data/ (Pure Math & Static Universe)
    ↓
src/shared/ (Leaf primitives, hooks, utils)
```

**Cardinal Rule**: Shared modules must NEVER import from features or pages.
