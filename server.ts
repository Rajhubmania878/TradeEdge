import path from 'path';
import fs from 'fs';
import express from 'express';
import { app } from './server/app';

// Process-level crash recovery and supervisor traps
process.on('uncaughtException', (err) => {
  console.error('[Server Supervisor] Trapped uncaughtException:', err?.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Supervisor] Trapped unhandledRejection at:', promise, 'reason:', reason);
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.join(process.cwd(), 'dist');
  const distIndexExists = fs.existsSync(path.join(distPath, 'index.html'));

  // Server initialized with gzip compression mounted in server/app.ts

  // Health check endpoint for automated status monitoring & auto-restart probes
  app.get('/api/health', (_req, res) => {
    const mem = process.memoryUsage();
    res.json({
      status: 'HEALTHY',
      uptime: Math.round(process.uptime()),
      timestamp: Date.now(),
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
      }
    });
  });

  // In production mode, serve static assets with long-term immutable caching
  if (process.env.NODE_ENV === 'production' && distIndexExists) {
    console.log('[Server] Serving production compiled build from dist/');
    // Immutable cache for fingerprinted static assets in /assets (1 year)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      etag: true
    }));
    // Standard cache for other root static files
    app.use(express.static(distPath, { maxAge: '1h', etag: true }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Mounting Vite dev middleware for live compilation...');
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Express global error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Express Error]:', err?.stack || err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err?.message || 'Unexpected application error'
      });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===========================================================`);
    console.log(`[Production Server] Ratio Spread Pro Terminal Running`);
    console.log(`[Status] ONLINE | Port: ${PORT} | Serving Build: ${distIndexExists}`);
    console.log(`[Supervisor] Crash recovery & instant compression active`);
    console.log(`===========================================================`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('[Server Startup Error]:', err);
    setTimeout(() => {
      console.log('[Server Supervisor] Attempting auto-restart after startup exception...');
      startServer().catch(e => console.error('[Server Supervisor] Fatal restart failure:', e));
    }, 2000);
  });
}

export default app;


