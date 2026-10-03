import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { authRouter } from './modules/auth/auth.routes';
import { marketRouter } from './modules/market/market.routes';
import { strategyRouter } from './modules/strategies/strategy.routes';
import { adminRouter } from './modules/admin/admin.routes';

export const app = express();

// Mount compression first so all API and static responses are compressed with Gzip
app.use(compression({ threshold: 512, level: 6 }));

// Global Middleware (JSON parser & CORS headers)
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Cache static JSON universe files in memory for zero-latency I/O responses
const universeCache: Record<string, string> = {};

function getCachedUniverseJson(filePath: string): string {
  if (!universeCache[filePath]) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      universeCache[filePath] = fs.readFileSync(fullPath, 'utf8');
    } else {
      universeCache[filePath] = JSON.stringify([]);
    }
  }
  return universeCache[filePath];
}

// Create API Router
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), service: 'Ratio Spread API' });
});

// Static Universe Datasets Endpoints with In-Memory Caching & HTTP Cache-Control
const sendCachedJson = (res: express.Response, filePath: string) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.send(getCachedUniverseJson(filePath));
};

apiRouter.get('/universe/nse-underlyings', (_req, res) => {
  sendCachedJson(res, 'src/data/angelUnderlyings.json');
});
apiRouter.get('/universe/nse-instruments', (_req, res) => {
  sendCachedJson(res, 'src/data/angelInstrumentsMap.json');
});
apiRouter.get('/universe/bse-underlyings', (_req, res) => {
  sendCachedJson(res, 'src/data/bseUnderlyings.json');
});
apiRouter.get('/universe/bse-instruments', (_req, res) => {
  sendCachedJson(res, 'src/data/bseInstrumentsMap.json');
});
apiRouter.get('/universe/bse-cash', (_req, res) => {
  sendCachedJson(res, 'src/data/bseCashUniverse.json');
});

// Mount Domain Module Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/angel', marketRouter);
apiRouter.use('/user', strategyRouter);
apiRouter.use('/admin', adminRouter);

// Mount apiRouter on '/api'
app.use('/api', apiRouter);

export default app;
