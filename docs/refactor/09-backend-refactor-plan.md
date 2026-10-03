# 09 — Backend & Server Architecture

## 1. Backend Modular Structure

Currently, `server.ts` (743 lines) and `api/index.ts` (534 lines) contain monolithic duplicate endpoints. We will modularize the backend under `/server/`:

```
server/
├── app.ts                        # Express application instance, CORS, JSON parser, router mounting
├── config/
│   ├── env.ts                    # Environment variables (PORT, NODE_ENV, VERCEL)
│   └── credentials.ts            # Angel One default credentials fallback
├── infrastructure/
│   ├── angelOneClient.ts         # SmartAPI REST client, rate limiters, quote chunking
│   ├── totp.ts                   # Base32 decoder and RFC 6238 TOTP generator
│   └── sessionStore.ts           # Token session store & expiry
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts        # /auth/login, /auth/signup, /auth/me, /auth/logout
│   │   ├── auth.controller.ts    # Request parsing and HTTP response shaping
│   │   ├── auth.service.ts       # Password hashing, token generation, user verification
│   │   └── auth.repository.ts    # In-memory user map & seeded accounts
│   ├── market/
│   │   ├── market.routes.ts      # /angel/status, /angel/quote, /angel/login
│   │   ├── market.controller.ts  # Quote batching and status response
│   │   └── market.service.ts     # Angel One SmartAPI session management
│   ├── strategies/
│   │   ├── strategy.routes.ts    # /user/saved-strategies (GET, POST, DELETE)
│   │   ├── strategy.controller.ts# Strategy payload validation
│   │   ├── strategy.service.ts   # User strategy business logic
│   │   └── strategy.repository.ts# Saved strategies in-memory store
│   └── admin/
│       ├── admin.routes.ts       # /admin/users, /admin/users/:id/*
│       ├── admin.controller.ts   # Admin action controller
│       └── admin.service.ts      # User status, role, and plan updates
└── shared/
    ├── middleware/
    │   ├── requireAuth.ts        # Bearer token verification middleware
    │   └── requireAdmin.ts       # Role === 'ADMIN' guard middleware
    └── utils/
        └── response.ts           # Standardized JSON response helpers
```

---

## 2. Server Entry Points

### Standalone Runner (`server.ts` - < 40 lines):
```typescript
import app from './server/app';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== 'production';

async function start() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`[Server] Running on port ${PORT}`));
}

if (!process.env.VERCEL) {
  start();
}

export default app;
```

### Vercel Serverless Function (`api/index.ts` - < 15 lines):
```typescript
import app from '../server/app';

// Export standard Express app directly for Vercel Serverless Function runtime
export default app;
```

This deduplicates 1,200+ lines of duplicate backend code into a single maintainable Express modular core.
