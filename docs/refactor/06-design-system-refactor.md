# 06 — Design System & UI Tokens

## 1. Unified Design Tokens

All CSS color, typography, spacing, and border radius variables will be consolidated into a single source of truth under `src/styles/tokens.css`.

### Semantic Color Tokens:

| Token Name | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg-canvas` | `#f8fafc` (slate-50) | `#090d16` (deep navy) | Root viewport background |
| `--color-bg-surface` | `#ffffff` | `#0f172a` (slate-900) | Card & table containers |
| `--color-bg-elevated` | `#ffffff` | `#1e293b` (slate-800) | Modals, drawers, tooltips |
| `--color-bg-overlay` | `#f1f5f9` | `#334155` | Dropdown hover states |
| `--color-border-default` | `#e2e8f0` | `#334155` | Table cell & panel borders |
| `--color-border-subtle` | `#f1f5f9` | `#1e293b` | Divider lines |
| `--color-text-primary` | `#0f172a` | `#f8fafc` | Headers, primary data values |
| `--color-text-secondary` | `#475569` | `#94a3b8` | Labels, subtitles |
| `--color-brand-primary` | `#059669` (emerald-600) | `#10b981` (emerald-500) | Active buttons, highlights |
| `--color-profit` | `#059669` | `#10b981` | Positive P&L, Credit Spreads |
| `--color-loss` | `#e11d48` (rose-600) | `#f43f5e` (rose-500) | Negative P&L, Debit Spreads |
| `--color-warning` | `#d97706` | `#f59e0b` | Asymmetric risk warnings |
| `--color-info` | `#0284c7` | `#38bdf8` | ATM strike badges, status pills |

---

## 2. Typography Hierarchy

```css
/* Monospace for financial data */
.font-mono, td.num-cell, span.num-val {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}

/* Sans-serif for UI labels and body */
body, button, input, select {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}
```

---

## 3. Style Structure

```
src/styles/
├── tokens.css        # CSS Custom Properties for theme tokens
├── reset.css         # Minimal reset and slim scrollbar styles
├── themeConfig.ts    # Ant Design ConfigProvider token mappings
└── index.css         # Tailwind CSS v4 root stylesheet importing tokens
```

---

## 4. Reusable Shared UI Primitives (`src/shared/components/`)

1. **`Badge.tsx`**: Consistent credit (green), debit (rose), and ATM (blue) badges.
2. **`MetricPill.tsx`**: Latency, tick rate, and feed status indicators.
3. **`TabSelector.tsx`**: Unified segmented controller for view switching.
4. **`DataTable.tsx`**: High-performance slim table wrapper with scroll synchronization.
5. **`ConfirmationModal.tsx`**: Standardized dialog for critical user actions.
