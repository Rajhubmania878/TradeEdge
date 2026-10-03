# 11 — Authentication & Security Plan

## 1. Authentication Architecture

- **Token Format**: Opaque random hex bearer tokens (`sess_<randomBytes(24)>`).
- **Password Hashing**: SHA-256 with application salt (`_RATIO_SPREAD_SALT_2026`).
- **Session Duration**: 18 hours max session lifetime matching Angel One SmartAPI daily refresh window.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Access to user management (`/admin/users`), user activation/suspension, plan upgrades, Angel One broker login reconfiguration.
  - `USER`: Access to live terminal, ratio matrix, scanner, strategy payoff simulator, and personal saved strategies.

---

## 2. Security Audits & Remediations

1. **Broker Credential Protection**:
   - SmartAPI PIN, API Key, and TOTP secret must be stored exclusively on the server side (`server/config/credentials.ts` or environment variables `process.env.ANGEL_*`).
   - The `/angel/status` endpoint must NEVER expose the API Key, PIN, or TOTP Secret in responses. Only `connected: boolean` and `clientCode: string` may be returned.

2. **CORS & Header Hardening**:
   - Set standard CORS headers allowing only necessary methods: `GET, POST, PATCH, DELETE, OPTIONS`.
   - Prevent MIME-sniffing and cross-frame script injection.

3. **Input Sanitization**:
   - Sanitize all incoming search queries and filter parameters.
   - Restrict ratio multipliers to positive integers between 1 and 10 to prevent resource exhaustion in combinatorial scanner generators.
