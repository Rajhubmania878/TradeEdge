# NSE & BSE Equity Options Ratio Spread Scanner

An institutional-grade web terminal for scanning, modeling, evaluating, and visualizing multi-leg equity option ratio spread strategies across the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE), integrated with live Angel One SmartAPI streaming and analytical risk payoff engines.

---

## Technical Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4, Ant Design 6, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express 4, TypeScript via TSX, Angel One SmartAPI TOTP/REST integration.
- **Quantitative Engines**: Black-Scholes Greeks Engine, Multi-Leg Risk Payoff & Breakeven Solver, Real-Time Open Interest (OI) Tracker.
- **Architecture**: Modular feature-driven full-stack architecture (undergoing phased refactoring migration).

---

## Architectural Refactoring Plan

The repository is currently scheduled for a safe, low-risk, phased architectural refactoring across **45 distinct implementation phases**. 

All architectural specifications, audits, migration maps, and verification checklists are documented under `docs/refactor/`:

- [00 — Refactor Overview](docs/refactor/00-refactor-overview.md)
- [01 — Current Architecture Audit](docs/refactor/01-current-architecture-audit.md)
- [02 — Target Architecture Specification](docs/refactor/02-target-architecture.md)
- [03 — Dependency & Coupling Analysis](docs/refactor/03-dependency-analysis.md)
- [04 — File Migration Map](docs/refactor/04-file-migration-map.md)
- [05 — Frontend Refactor Plan](docs/refactor/05-frontend-refactor-plan.md)
- [06 — Design System & UI Tokens](docs/refactor/06-design-system-refactor.md)
- [07 — State Management & Ownership Plan](docs/refactor/07-state-management-plan.md)
- [08 — API Contracts & Client Normalization](docs/refactor/08-api-refactor-plan.md)
- [09 — Backend & Server Architecture](docs/refactor/09-backend-refactor-plan.md)
- [10 — Data Layer & Persistence](docs/refactor/10-data-layer-plan.md)
- [11 — Authentication & Security Plan](docs/refactor/11-auth-security-plan.md)
- [12 — Testing & Quality Strategy](docs/refactor/12-testing-strategy.md)
- [13 — Performance Optimization Plan](docs/refactor/13-performance-plan.md)
- [14 — Dead Code & Cleanup Plan](docs/refactor/14-cleanup-plan.md)
- [15 — Phased Migration Guide (45 Phases)](docs/refactor/15-migration-phases.md)
- [16 — Verification Gate Checklist](docs/refactor/16-verification-checklist.md)
- [17 — Rollback & Recovery Strategy](docs/refactor/17-rollback-strategy.md)
- [18 — Final Target Project Tree](docs/refactor/18-final-target-tree.md)
- [19 — Refactoring Progress Tracker](docs/refactor/19-refactor-progress.md)
- [20 — Architectural Decisions Log (ADRs)](docs/refactor/20-decisions-log.md)

---

## Development Setup

```bash
# Install dependencies
npm install

# Start development full-stack server (Port 3000)
npm run dev

# Run TypeScript compilation checks
npm run lint

# Build production bundle
npm run build
```
