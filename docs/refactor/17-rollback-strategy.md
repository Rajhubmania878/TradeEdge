# 17 — Rollback & Recovery Strategy

## 1. Per-Phase Rollback Strategy

Because all 45 implementation phases are designed as small, isolated increments (affecting 3–8 related files per phase), rollbacks are quick, deterministic, and isolated.

### Step-by-Step Rollback Protocol:
1. **Detect Failure**: If compilation fails, tests break, or runtime errors occur and cannot be fixed in ≤ 2 minor adjustments:
   ```bash
   # 1. Identify modified files in current phase
   git status
   ```
2. **Revert Phase Changes**:
   ```bash
   # 2. Revert modified files
   git checkout -- <modified_files>
   
   # 3. Remove any newly created files in this phase
   rm -f <created_files>
   ```
3. **Verify Restored Baseline**:
   ```bash
   # 4. Verify system compiles cleanly at pre-phase state
   npm run lint
   npm run build
   ```
4. **Log Incident**: Update status in `docs/refactor/19-refactor-progress.md` to `BLOCKED`, noting the failure reason.

---

## 2. API Contract Rollback Protocol

When refactoring backend routes (`server/modules/*`):
- Maintain legacy bridge routes in parallel on `server/app.ts` (`/api/*` and `/*`) so older frontend components never experience 404s during transition.
- Never drop a legacy response field until all frontend callers are verified to use the new contract.

---

## 3. Storage & State Rollback Protocol

- Client-side `localStorage` keys (`ratio_spread_auth_token`, `ratio_spread_saved_strategies`, `app_theme_mode`) must never be renamed or reformatted in a destructive manner.
- Seeded accounts in `server/modules/auth/auth.repository.ts` are immutable fallbacks and will immediately restore access if session caching faults.
