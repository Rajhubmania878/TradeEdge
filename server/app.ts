import express from 'express';
import compression from 'compression';
import { authRouter } from './modules/auth/auth.routes';
import { marketRouter } from './modules/market/market.routes';
import { strategyRouter } from './modules/strategies/strategy.routes';
import { adminRouter } from './modules/admin/admin.routes';

// Import universe datasets directly to guarantee availability in all runtime environments
// (including Vercel Serverless Functions where process.cwd() dynamic reads fail)
import angelUnderlyings from '../src/data/angelUnderlyings.json';
import angelInstrumentsMap from '../src/data/angelInstrumentsMap.json';
import bseUnderlyings from '../src/data/bseUnderlyings.json';
import bseInstrumentsMap from '../src/data/bseInstrumentsMap.json';
import bseCashUniverse from '../src/data/bseCashUniverse.json';

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

// Pre-serialized JSON strings for zero-serialization-overhead responses
const nseUnderlyingsJson = JSON.stringify(angelUnderlyings);
const nseInstrumentsJson = JSON.stringify(angelInstrumentsMap);
const bseUnderlyingsJson = JSON.stringify(bseUnderlyings);
const bseInstrumentsJson = JSON.stringify(bseInstrumentsMap);
const bseCashJson = JSON.stringify(bseCashUniverse);

// Create API Router
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'Ratio Spread API',
    universeLoaded: {
      nse: angelUnderlyings.length,
      bse: bseUnderlyings.length,
      bseCash: bseCashUniverse.length
    }
  });
});

// Static Universe Datasets Endpoints with In-Memory Caching & HTTP Cache-Control
const sendStaticUniverse = (res: express.Response, jsonStr: string) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.send(jsonStr);
};

apiRouter.get('/universe/nse-underlyings', (_req, res) => {
  sendStaticUniverse(res, nseUnderlyingsJson);
});
apiRouter.get('/universe/nse-instruments', (_req, res) => {
  sendStaticUniverse(res, nseInstrumentsJson);
});
apiRouter.get('/universe/bse-underlyings', (_req, res) => {
  sendStaticUniverse(res, bseUnderlyingsJson);
});
apiRouter.get('/universe/bse-instruments', (_req, res) => {
  sendStaticUniverse(res, bseInstrumentsJson);
});
apiRouter.get('/universe/bse-cash', (_req, res) => {
  sendStaticUniverse(res, bseCashJson);
});

// Mount Domain Module Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/angel', marketRouter);
apiRouter.use('/user', strategyRouter);
apiRouter.use('/admin', adminRouter);

// Mount apiRouter on '/api'
app.use('/api', apiRouter);

// Support serverless environments (e.g. Vercel) where URL rewrites might strip the '/api' prefix
app.use((req, res, next) => {
  if (
    req.path.startsWith('/universe') ||
    req.path.startsWith('/auth') ||
    req.path.startsWith('/angel') ||
    req.path.startsWith('/user') ||
    req.path.startsWith('/admin') ||
    req.path === '/health'
  ) {
    return apiRouter(req, res, next);
  }
  next();
});

export default app;
