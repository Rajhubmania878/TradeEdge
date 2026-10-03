# 07 — State Management & Ownership Plan

## 1. State Classification & Ownership Matrix

Currently, `src/App.tsx` holds 26+ state hooks. This plan distributes state into its appropriate lifecycle scope:

| State Variable | Current Location | Target Scope | Target Location | Migration Phase |
| :--- | :--- | :--- | :--- | :---: |
| `currentUser`, `viewMode` | `App.tsx` (Local) | Global Auth State | `src/store/AuthContext.tsx` | 29 |
| `exchange`, `symbol`, `expiry`, `optionType`, `ratioLong`, `ratioShort` | `App.tsx` (Local) | Feature State | `src/store/TerminalContext.tsx` | 28 |
| `gap`, `cnt`, `stk`, `minStrike`, `maxStrike`, `density` | `App.tsx` (Local) | Feature State | `src/features/ratio-matrix/store/` | 28 |
| `contracts`, `currentSpot`, `futurePrice`, `metrics`, `isStreaming` | `App.tsx` (Local) | Server/Feed State | `src/store/MarketDataContext.tsx` | 28 |
| `filter`, `sortField`, `sortDirection` | `App.tsx` (Local) | Feature State | `src/features/spread-scanner/store/` | 28 |
| `savedPresets` | `App.tsx` (Local) | Persistent User State | `src/features/user-strategies/store/` | 28 |
| `selectedStrategyRow` | `App.tsx` (Local) | UI Selection State | `src/store/TerminalContext.tsx` | 28 |
| `isFocusMode`, `isFullscreen` | `App.tsx` (Local) | UI Viewport State | `src/shared/hooks/useViewportMode.ts` | 13 |
| `isAngelModalOpen`, `isTestModalOpen` | `App.tsx` (Local) | Local Modal State | Respective Modal Triggers | 28 |

---

## 2. Store Architecture

### 1. `AuthContext.tsx` (`src/store/AuthContext.tsx`)
- **State**: `user: UserProfile | null`, `token: string | null`, `isAuthenticated: boolean`, `isAdmin: boolean`.
- **Actions**: `login(email, pass)`, `signup(...)`, `logout()`, `refreshUser()`.

### 2. `TerminalContext.tsx` (`src/store/TerminalContext.tsx`)
- **State**: `exchange: Exchange`, `symbol: string`, `expiry: string`, `optionType: OptionType`, `direction: DirectionMode`, `ratio: [number, number]`, `activeTab: MainTabType`, `selectedStrategy: RatioStrategyRow | null`.
- **Actions**: `setExchange(ex)`, `setSymbol(sym)`, `setExpiry(exp)`, `setRatio(l, s)`, `selectStrategy(strat)`.

### 3. `MarketDataContext.tsx` (`src/store/MarketDataContext.tsx`)
- **State**: `contracts: Map<string, OptionContract>`, `currentSpot: number`, `futurePrice: number`, `metrics: MarketFeedMetrics`, `isStreaming: boolean`.
- **Actions**: `toggleStreaming()`, `refreshLiveQuotes()`, `switchExchange(ex)`.

---

## 3. Elimination of Prop Drilling

By moving `exchange`, `stock`, `expiry`, and `contracts` to Context, `App.tsx` eliminates passing 15+ repetitive props down to `RatioMatrixSpreadsheet`, `ControlsPanel`, `HeaderBar`, and `StatusBar`.
