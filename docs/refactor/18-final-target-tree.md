# 18 — Final Target Project Tree

Below is the complete, definitive recommended target directory tree for the repository after all 45 phases are executed.

```
/
├── .env.example                                  # Environment variables reference
├── .gitignore                                    # Git ignore rules
├── .npmrc                                        # NPM configuration
├── AGENTS.md                                     # AI & Engineering agent operating instructions
├── README.md                                     # Project overview & technical stack documentation
├── index.html                                    # Single-page application HTML entry
├── metadata.json                                 # AI Studio applet metadata & permissions
├── package.json                                  # NPM dependencies & build scripts
├── tsconfig.json                                 # TypeScript compiler options & path aliases
├── vercel.json                                   # Vercel deployment configuration
├── vite.config.ts                                # Vite bundler & Tailwind v4 plugin configuration
│
├── api/
│   └── index.ts                                  # Thin Vercel serverless adapter importing server/app.ts
│
├── server.ts                                     # Standalone Express development & production runner
│
├── server/                                       # Backend Node.js / Express Core Architecture
│   ├── app.ts                                    # Express application bootstrap & route mounting
│   ├── config/
│   │   ├── env.ts                                # Environment configuration (PORT, NODE_ENV, VERCEL)
│   │   └── credentials.ts                        # Broker credentials configuration
│   ├── infrastructure/
│   │   ├── angelOneClient.ts                     # SmartAPI REST client, rate limiters, quote batching
│   │   └── totp.ts                               # RFC 6238 TOTP generator & Base32 decoder
│   ├── modules/
│   │   ├── auth/                                 # Authentication & user profile module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── index.ts
│   │   ├── market/                               # Market quote & SmartAPI session module
│   │   │   ├── market.controller.ts
│   │   │   ├── market.routes.ts
│   │   │   ├── market.service.ts
│   │   │   └── index.ts
│   │   ├── strategies/                           # User saved strategies CRUD module
│   │   │   ├── strategy.controller.ts
│   │   │   ├── strategy.repository.ts
│   │   │   ├── strategy.routes.ts
│   │   │   ├── strategy.service.ts
│   │   │   └── index.ts
│   │   └── admin/                                # Admin user management module
│   │       ├── admin.controller.ts
│   │       ├── admin.routes.ts
│   │       ├── admin.service.ts
│   │       └── index.ts
│   └── shared/
│       ├── middleware/
│       │   ├── requireAdmin.ts                   # Role === 'ADMIN' guard middleware
│       │   ├── requireAuth.ts                    # Bearer session authorization middleware
│       │   └── index.ts
│       └── utils/
│           └── response.ts                       # Standard JSON response helpers
│
├── src/                                          # Frontend React SPA Architecture
│   ├── main.tsx                                  # React DOM entry point mounting AppProviders & App
│   │
│   ├── app/                                      # Application Bootstrap, Providers & Routing
│   │   ├── App.tsx                               # Lean root application component (< 50 lines)
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx                    # Backdrop layout for Login & Signup pages
│   │   │   ├── TerminalLayout.tsx                # Viewport layout (Header + Snapshot + Main + Status)
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx                  # Composed root providers wrapper
│   │   │   ├── ThemeProvider.tsx                 # Dark/Light theme mode provider
│   │   │   └── index.ts
│   │   └── routes/
│   │       ├── AppRouter.tsx                     # Route & view mode controller
│   │       └── index.ts
│   │
│   ├── pages/                                    # Route-Level Page Views
│   │   ├── landing/
│   │   │   └── LandingPage.tsx                   # Unauthenticated landing & marketing view
│   │   ├── auth/
│   │   │   ├── ForgotPasswordPage.tsx            # Password reset request view
│   │   │   ├── LoginPage.tsx                     # User login view with demo account buttons
│   │   │   ├── SignupPage.tsx                    # User registration view
│   │   │   └── TermsPage.tsx                     # Terms of Service & Privacy Policy view
│   │   ├── terminal/
│   │   │   └── MainTerminalPage.tsx              # Main authenticated options terminal page
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx                  # User profile & default preferences page
│   │   └── admin/
│   │       └── AdminPage.tsx                     # System administrator user management panel
│   │
│   ├── features/                                 # Domain-Specific Feature Modules
│   │   ├── ratio-matrix/                         # View 1: Flagship Ratio Matrix Spreadsheet
│   │   │   ├── components/
│   │   │   │   ├── GapStepHeader.tsx             # Validated gap column headers
│   │   │   │   ├── MatrixCellRenderer.tsx        # Net entry cell with hover tooltip
│   │   │   │   ├── MatrixStrikeRow.tsx           # Strike row with Call/Put moneyness
│   │   │   │   ├── RatioMatrixSpreadsheet.tsx    # Root matrix spreadsheet table
│   │   │   │   └── StrategyControlBar.tsx        # Flagship GAP, CNT, STK, MIN, MAX toolbar
│   │   │   └── index.ts
│   │   ├── spread-scanner/                       # View 2: Multi-Leg Spread Scanner
│   │   │   ├── components/
│   │   │   │   ├── ControlsPanel.tsx             # Scanner ratio & gap mode controls
│   │   │   │   ├── FilterToolbar.tsx             # Credit/Debit, OI, Profit filter toolbar
│   │   │   │   └── RatioSpreadGrid.tsx           # Sortable strategy card grid
│   │   │   └── index.ts
│   │   ├── option-chain/                         # View 3: Dual View Call/Put Option Chain
│   │   │   ├── components/
│   │   │   │   └── OptionChainDualView.tsx       # Dual Call/Put option chain table
│   │   │   └── index.ts
│   │   ├── all-ratios/                           # View 4: Comparative All Ratios Scanner
│   │   │   ├── components/
│   │   │   │   └── AllRatiosScanner.tsx          # 1:1, 1:2, 1:3, 2:3 comparative scanner
│   │   │   └── index.ts
│   │   ├── payoff-analyzer/                      # Multi-Leg Risk Payoff Visualizer
│   │   │   ├── components/
│   │   │   │   └── PayoffChart.tsx               # Interactive SVG payoff curve & spot marker
│   │   │   └── index.ts
│   │   ├── market-feed/                          # Real-Time Market Data Streamer
│   │   │   ├── components/
│   │   │   │   ├── AngelOneModal.tsx             # Angel One broker login & credentials modal
│   │   │   │   └── MarketSnapshotStrip.tsx       # Cash spot, future, straddle, DTE ticker strip
│   │   │   ├── services/
│   │   │   │   └── marketDataFeed.ts             # Ticker polling & tick dispatcher service
│   │   │   └── index.ts
│   │   └── user-strategies/                      # Strategy Inspection & Preset Management
│   │       ├── components/
│   │       │   ├── SelectedStrategyPanel.tsx     # Selected strategy bottom drawer
│   │       │   └── StrategyDetailDrawer.tsx      # Comprehensive multi-leg risk inspector
│   │       └── index.ts
│   │
│   ├── shared/                                   # Domain-Agnostic Reusable Units
│   │   ├── components/
│   │   │   ├── feedback/
│   │   │   │   ├── Badges.tsx                    # Credit, Debit, ATM, Status badges
│   │   │   │   ├── StatusBar.tsx                 # Viewport bottom telemetry status bar
│   │   │   │   └── UnitTestsModal.tsx            # Built-in 17-test regression runner modal
│   │   │   ├── inputs/
│   │   │   │   └── StockSelectorDropdown.tsx     # Exchange & stock search selector
│   │   │   └── navigation/
│   │   │       └── HeaderBar.tsx                 # Top navigation header & user profile
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts                    # Generic value debounce hook
│   │   │   ├── useFullscreen.ts                  # Viewport fullscreen toggle hook
│   │   │   ├── useLocalStorage.ts                # Type-safe localStorage hook
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                             # Classname joiner utility
│   │   │   ├── formatters.ts                     # Rupee, percentage, and Greeks formatters
│   │   │   └── index.ts
│   │   └── types/
│   │       ├── auth.ts                           # User profile & role types
│   │       ├── market.ts                         # Option contracts & strategy row types
│   │       ├── options.ts                        # Option types & leg sides
│   │       └── index.ts
│   │
│   ├── engine/                                   # Quantitative Core Algorithms
│   │   ├── blackScholes.ts                       # Black-Scholes pricing, IV solver, Greeks
│   │   ├── engineTests.ts                        # Built-in 17 automated regression tests
│   │   ├── oiTracker.ts                          # Open interest delta tracker
│   │   ├── payoffEngine.ts                       # Multi-leg payoff, breakeven solver, risk bounds
│   │   └── index.ts
│   │
│   ├── data/                                     # Market Universes & Instrument Maps
│   │   ├── angelInstrumentsMap.json              # Angel One NSE instrument token dictionary
│   │   ├── angelUnderlyings.json                 # NSE underlyings metadata
│   │   ├── bseCashUniverse.json                  # BSE Cash equity stock universe (1000+ stocks)
│   │   ├── bseInstrumentsMap.json                # BSE instrument token dictionary
│   │   ├── bseUnderlyings.json                   # BSE derivative option underlyings (200+ stocks)
│   │   ├── bseUniverse.ts                        # BSE options & cash universe resolution functions
│   │   ├── nseUniverse.ts                        # NSE equity options universe resolution functions
│   │   ├── universeManager.ts                    # Unified exchange-aware universe facade
│   │   └── index.ts
│   │
│   ├── services/                                 # HTTP API Transport Clients
│   │   ├── api/
│   │   │   └── apiClient.ts                      # Normalized fetch wrapper with Bearer token interceptor
│   │   ├── authApi.ts                            # Auth & user profile API client
│   │   ├── marketApi.ts                          # Angel One quotes & status API client
│   │   ├── strategyApi.ts                        # Saved strategies API client
│   │   └── index.ts
│   │
│   ├── store/                                    # Domain State Stores
│   │   ├── AuthContext.tsx                       # User session & authentication state
│   │   ├── MarketDataContext.tsx                 # Live contracts map & telemetry state
│   │   ├── TerminalContext.tsx                   # Exchange, stock, expiry, ratio configuration state
│   │   └── index.ts
│   │
│   └── styles/                                   # Design System & Styling
│       ├── index.css                             # Tailwind CSS v4 root stylesheet
│       ├── themeConfig.ts                        # Ant Design dark/light theme token configurations
│       └── tokens.css                            # Semantic CSS custom properties
│
└── docs/
    └── refactor/                                 # Complete Refactoring Architecture Documentation
        ├── 00-refactor-overview.md
        ├── 01-current-architecture-audit.md
        ├── 02-target-architecture.md
        ├── 03-dependency-analysis.md
        ├── 04-file-migration-map.md
        ├── 05-frontend-refactor-plan.md
        ├── 06-design-system-refactor.md
        ├── 07-state-management-plan.md
        ├── 08-api-refactor-plan.md
        ├── 09-backend-refactor-plan.md
        ├── 10-data-layer-plan.md
        ├── 11-auth-security-plan.md
        ├── 12-testing-strategy.md
        ├── 13-performance-plan.md
        ├── 14-cleanup-plan.md
        ├── 15-migration-phases.md
        ├── 16-verification-checklist.md
        ├── 17-rollback-strategy.md
        ├── 18-final-target-tree.md
        ├── 19-refactor-progress.md
        └── 20-decisions-log.md
```
