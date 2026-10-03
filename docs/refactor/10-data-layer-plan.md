# 10 — Data Layer & Persistence

## 1. Storage Architecture

The application currently utilizes a two-tier persistence model:
1. **Server-Side In-Memory Store**: `usersStore` (Map of UserRecords), `sessionsStore` (Map of token -> userId), and `savedStrategiesStore` (Array of SavedStrategyRecords).
2. **Client-Side Fallback Storage (`localStorage`)**: Offline fallback accounts (`ratio_spread_registered_users`), active session token (`ratio_spread_auth_token`), and offline presets (`ratio_spread_saved_strategies`).

---

## 2. Server Repository Layer

To insulate business services from storage mechanisms, all in-memory collections will be encapsulated behind clean repository interfaces:

### `IUserRepository`:
```typescript
export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(user: UserRecord): Promise<UserRecord>;
  update(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null>;
  findAll(): Promise<UserRecord[]>;
}
```

### `IStrategyRepository`:
```typescript
export interface IStrategyRepository {
  findByUserId(userId: string): Promise<SavedStrategyRecord[]>;
  create(strategy: SavedStrategyRecord): Promise<SavedStrategyRecord>;
  delete(id: string, userId: string): Promise<boolean>;
}
```

This guarantees that if the application upgrades to PostgreSQL (Cloud SQL) or SQLite in the future, only the repository implementation changes without altering controllers or services.

---

## 3. Data Integrity Rules

1. **Password Security**: Never return `passwordHash` in any JSON response. Controllers must destructure `{ passwordHash: _, ...publicProfile }`.
2. **User Strategy Isolation**: Deleting or querying strategies must strictly verify `userId === req.user.id`.
3. **Seeded Test Accounts**: Pre-seeded accounts (`admin@ratiospread.com`, `pro@ratiospread.com`, `demo@ratiospread.com`) will be loaded automatically on server initialization.
