# 05 — Frontend Refactor Plan

## 1. Application Bootstrap & Root Architecture

Currently, `src/main.tsx` mounts `ThemeProvider` and `ConfigProvider` directly around `App.tsx`. 

### Target Bootstrap Hierarchy:
```tsx
// src/main.tsx
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

### Provider Composition (`src/app/providers/AppProviders.tsx`):
1. `ThemeProvider` (Theme mode management, dark/light toggle)
2. `AntdConfigProvider` (Ant Design design tokens mapped to CSS variables)
3. `AuthProvider` (User identity, bearer token, RBAC permissions)
4. `TerminalProvider` (Active exchange, symbol, expiry, ratio configuration)
5. `MarketDataProvider` (Live option contracts, spot/future quotes, telemetry metrics)

---

## 2. Route & Layout Architecture

Replace the conditional `if (viewMode === 'LANDING')` switch in `App.tsx` with a clean view router:

### Route Definition:
- `/` or `viewMode='LANDING'`: `LandingPage` (Unauthenticated marketing view)
- `/login`: `LoginPage`
- `/signup`: `SignupPage`
- `/forgot-password`: `ForgotPasswordPage`
- `/terms`: `TermsPage`
- `/privacy`: `PrivacyPage`
- `/terminal`: `MainTerminalPage` (Protected terminal workspace)
- `/settings`: `SettingsPage`
- `/admin`: `AdminPage` (Protected `role === 'ADMIN'`)

### Layout Wrappers:
- `AuthLayout`: Centered card layout with trading logo and security badges for Login/Signup.
- `TerminalLayout`: Full-viewport header, market snapshot strip, central workspace, and bottom status bar.

---

## 3. Page vs Feature vs Shared Responsibility Matrix

| Layer | Responsibility | Allowed Code | Examples |
| :--- | :--- | :--- | :--- |
| **Page** | Route composition, layout wrapping, top-level error boundaries | Route parameters, layout tags, mounting features | `LandingPage`, `MainTerminalPage`, `AdminPage` |
| **Feature** | Domain business logic, complex data visualization, domain workflows | Domain state hooks, feature tables, forms, domain drawer | `RatioMatrixSpreadsheet`, `RatioSpreadGrid`, `PayoffChart` |
| **Shared UI** | Reusable presentational building blocks | Stateless UI, generic props, ARIA accessibility tags | `HeaderBar`, `StatusBar`, `StockSelectorDropdown` |

---

## 4. Component Refactoring Breakdown

### `RatioMatrixSpreadsheet.tsx` (621 lines -> 4 focused sub-components):
1. `RatioMatrixSpreadsheet.tsx` (Root table container & header row)
2. `MatrixStrikeRow.tsx` (Single strike row with Call/Put LTP and moneyness highlight)
3. `MatrixCellRenderer.tsx` (Net Entry / Net Credit calculation cell with hover tooltip)
4. `GapStepHeader.tsx` (Dynamic gap column headers: GAP ₹50, GAP ₹100, etc.)

### `ControlsPanel.tsx` (340 lines -> 3 modular control groups):
1. `StockExpirySelector.tsx` (Exchange, stock search, expiry pills)
2. `RatioConfigGroup.tsx` (Long:Short ratio counters: 1:2, 1:3, 2:5)
3. `ScannerFilterBar.tsx` (Gap mode, price step, strike range slider)

---

## 5. Responsive Behavior & Accessibility

1. **Tabular Numerics**: Ensure all monetary amounts, strikes, and Greeks use `font-mono tabular-nums` (`'JetBrains Mono'`) to avoid horizontal jitter during tick updates.
2. **Color Contrast**: Enforce WCAG AA contrast on dark background (`#090d16` canvas with `#10b981` profit green and `#f43f5e` loss red).
3. **Keyboard Navigation**: Matrix cells and table rows must support keyboard navigation (`Enter` to open strategy detail drawer).
