# 14 — Dead Code & Cleanup Plan

## 1. Deferral Policy

**Strict Rule**: No file or export deletion will occur until Phase 44 (Dead-Code Cleanup). Moving files and updating imports happens first. Deprecated files are kept as thin re-exports until the migration phase is complete.

---

## 2. Identified Cleanup Targets (Scheduled for Phase 44)

1. **Obsolete Monolith Handlers**:
   - Clean up monolithic duplicate functions in `server.ts` and `api/index.ts` after both delegate to `server/app.ts`.
2. **Duplicate LocalStorage Mock Fallbacks**:
   - Clean up duplicate mock registration arrays once centralized under `src/services/authApi.ts`.
3. **Legacy Relative Barrel Files**:
   - Remove deprecated bridge re-export files created during intermediate migration phases.
4. **Unused Imports & Types**:
   - Run `npx tsc --noEmit` and remove unused imports across components.
