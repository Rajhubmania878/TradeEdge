# 08 — API Contracts & Client Normalization

## 1. Unified Frontend API Client

Create a normalized HTTP client (`src/services/api/apiClient.ts`) using standard `fetch` with request interceptors (attaching `Authorization: Bearer <token>` automatically) and centralized error handling.

---

## 2. API Contract Inventory

| Method | Path | Frontend Consumer | Backend Handler | Request Type | Response Type | Auth Req | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `GET` | `/api/health` | Health checks | `handleHealth` | None | `{ status: string, timestamp: number }` | None | Low |
| `POST` | `/api/auth/signup` | `authService.signup` | `handleSignup` | `{ email, password, displayName }` | `{ success: boolean, message: string }` | None | Medium |
| `POST` | `/api/auth/login` | `authService.login` | `handleLogin` | `{ email, password }` | `{ success: boolean, token: string, user: UserProfile }` | None | Medium |
| `GET` | `/api/auth/me` | `authService.me` | `handleMe` | None | `{ success: boolean, user: UserProfile }` | Bearer | Medium |
| `POST` | `/api/auth/logout` | `authService.logout` | `handleLogout` | None | `{ success: boolean }` | Bearer | Low |
| `GET` | `/api/user/saved-strategies` | `authService.getSavedStrategies` | `handleGetStrategies` | None | `{ success: boolean, strategies: SavedStrategy[] }` | Bearer | Medium |
| `POST` | `/api/user/saved-strategies` | `authService.saveStrategy` | `handleSaveStrategy` | `Omit<SavedStrategy, 'id' \| 'userId'>` | `{ success: boolean, strategy: SavedStrategy }` | Bearer | Medium |
| `DELETE` | `/api/user/saved-strategies/:id` | `authService.deleteSavedStrategy` | `handleDeleteStrategy` | None | `{ success: boolean }` | Bearer | Medium |
| `GET` | `/api/admin/users` | `authService.adminGetUsers` | `handleAdminGetUsers` | None | `{ success: boolean, users: UserProfile[] }` | Admin | Medium |
| `PATCH` | `/api/admin/users/:id/status` | `authService.adminUpdateUserStatus` | `handleAdminUpdateStatus` | `{ isActive: boolean }` | `{ success: boolean, user: UserProfile }` | Admin | Medium |
| `PATCH` | `/api/admin/users/:id/role` | `authService.adminUpdateUserRole` | `handleAdminUpdateRole` | `{ role: 'ADMIN' \| 'USER' }` | `{ success: boolean, user: UserProfile }` | Admin | Medium |
| `PATCH` | `/api/admin/users/:id/plan` | `authService.adminUpdateUserPlan` | `handleAdminUpdatePlan` | `{ plan: 'FREE' \| 'PRO' }` | `{ success: boolean, user: UserProfile }` | Admin | Medium |
| `GET` | `/api/angel/status` | `marketDataFeed` | `handleAngelStatus` | None | `{ connected: boolean, clientCode: string, mode: string }` | None | Low |
| `POST` | `/api/angel/login` | `AngelOneModal` | `handleAngelLogin` | `{ apiKey, clientCode, pin, totpSecret }` | `{ success: boolean, connected: boolean }` | Admin | High |
| `POST` | `/api/angel/quote` | `marketDataFeed.fetchLiveQuotes` | `handleAngelQuote` | `{ nseTokens?, nfoTokens?, bseTokens?, bfoTokens? }` | `{ success: boolean, data: Quote[] }` | Bearer | High |

---

## 3. Separation of Concerns in API Layer

```
UI Component (e.g. RatioMatrixSpreadsheet)
    ↓ calls
Feature Action / Store Dispatch
    ↓ calls
Feature Service / API Client (e.g. marketApi.ts)
    ↓ executes HTTP via
Base HTTP Client (apiClient.ts with Bearer Token interceptor)
    ↓ fetches
Express Backend / Vercel Serverless Function
```

Components will never invoke raw `fetch('/api/...')` directly.
