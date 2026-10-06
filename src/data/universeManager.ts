import { Exchange, UnderlyingStock, OptionType, BseCashStock } from '../types/market';
import {
  NSE_EQUITY_UNIVERSE,
  getAllUnderlyings as getAllNseUnderlyings,
  getUnderlyingBySymbol as getNseUnderlyingBySymbol,
  getAvailableExpiries as getNseAvailableExpiries,
  getListedStrikes as getNseListedStrikes,
  resolveAngelToken as resolveNseAngelToken,
  resolveAngelFutToken as resolveNseAngelFutToken,
  resolveAngelCashToken as resolveNseAngelCashToken,
  generateTradingSymbol as generateNseTradingSymbol,
  getAtmStrike as getNseAtmStrike,
  getDaysToExpiry as getNseDaysToExpiry,
  formatExpiry as formatNseExpiry,
  normalizeExpiry as normalizeNseExpiry,
  getAvailableSectors as getNseAvailableSectors,
  setNseUniverseData
} from './nseUniverse';
import {
  BSE_EQUITY_UNIVERSE,
  BSE_CASH_UNIVERSE,
  getAllBseUnderlyings,
  getAllBseCashStocks,
  getBseUnderlyingBySymbol,
  getBseAvailableExpiries,
  getBseListedStrikes,
  resolveBseAngelToken,
  resolveBseAngelFutToken,
  resolveBseAngelCashToken,
  generateBseTradingSymbol,
  getBseAtmStrike,
  getBseDaysToExpiry,
  formatBseExpiry,
  normalizeBseExpiry,
  getBseAvailableSectors,
  setBseUniverseData,
  setBseCashUniverse
} from './bseUniverse';

// Promise caching to prevent multiple parallel initialization calls
let initPromise: Promise<void> | null = null;

/**
 * Dynamically loads and populates all the NSE/BSE universes asynchronously at runtime.
 * Completely unblocks compile-time module parsing and eliminates large bundle chunks.
 */
export function initializeUniverseData(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      let nseUnderlyings: any[] = [];
      let nseInstruments: any = null;
      let bseUnderlyings: any[] = [];
      let bseInstruments: any = null;

      // 1. Attempt to fetch pre-cached compressed datasets from API endpoints
      try {
        const [u1, i1, u2, i2] = await Promise.all([
          fetch('/api/universe/nse-underlyings').then(r => (r.ok ? r.json() : null)),
          fetch('/api/universe/nse-instruments').then(r => (r.ok ? r.json() : null)),
          fetch('/api/universe/bse-underlyings').then(r => (r.ok ? r.json() : null)),
          fetch('/api/universe/bse-instruments').then(r => (r.ok ? r.json() : null))
        ]);

        if (Array.isArray(u1) && u1.length > 0) nseUnderlyings = u1;
        if (i1 && typeof i1 === 'object' && Object.keys(i1).length > 0) nseInstruments = i1;
        if (Array.isArray(u2) && u2.length > 0) bseUnderlyings = u2;
        if (i2 && typeof i2 === 'object' && Object.keys(i2).length > 0) bseInstruments = i2;
      } catch (networkErr) {
        console.warn('[UniverseManager] API fetch failed, falling back to local module imports:', networkErr);
      }

      // 2. If API returned empty arrays or failed (common on serverless cold starts, static hosts like Vercel, or offline)
      if (nseUnderlyings.length === 0 || !nseInstruments || bseUnderlyings.length === 0 || !bseInstruments) {
        console.info('[UniverseManager] Loading local universe dataset fallback via code-split chunks...');
        const [
          localNseUnderlyings,
          localNseInstruments,
          localBseUnderlyings,
          localBseInstruments
        ] = await Promise.all([
          import('./angelUnderlyings.json').then(m => m.default || m),
          import('./angelInstrumentsMap.json').then(m => m.default || m),
          import('./bseUnderlyings.json').then(m => m.default || m),
          import('./bseInstrumentsMap.json').then(m => m.default || m)
        ]);

        if (nseUnderlyings.length === 0) nseUnderlyings = localNseUnderlyings;
        if (!nseInstruments) nseInstruments = localNseInstruments;
        if (bseUnderlyings.length === 0) bseUnderlyings = localBseUnderlyings;
        if (!bseInstruments) bseInstruments = localBseInstruments;
      }

      setNseUniverseData(nseUnderlyings, nseInstruments);
      setBseUniverseData(bseUnderlyings, bseInstruments, []);

      // Asynchronously fetch large BSE cash universe in the background without blocking terminal launch
      const loadBseCash = async () => {
        try {
          const res = await fetch('/api/universe/bse-cash');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setBseCashUniverse(data);
              return;
            }
          }
        } catch {
          // fall through to local fallback
        }
        const localCash = await import('./bseCashUniverse.json').then(m => m.default || m);
        setBseCashUniverse(localCash);
      };

      loadBseCash().catch(err => {
        console.warn('[UniverseManager] Background BSE cash load:', err);
      });
      
      const { marketDataFeed } = await import('../services/marketDataFeed');
      marketDataFeed.reinitCurrentContracts();
      console.log('[UniverseManager] Universal F&O datasets successfully loaded at runtime.');
    } catch (err) {
      console.error('[UniverseManager] Failed to load datasets asynchronously:', err);
      initPromise = null; // Allow retry on failure
      throw err;
    }
  })();

  return initPromise;
}

export function isUniverseInitialized(): boolean {
  return initPromise !== null;
}

/**
 * Returns all active option underlyings for the selected exchange.
 */
export function getUnderlyingsForExchange(exchange: Exchange): UnderlyingStock[] {
  return exchange === 'BSE' ? getAllBseUnderlyings() : getAllNseUnderlyings();
}

/**
 * Returns all cash equities for the selected exchange.
 */
export function getCashStocksForExchange(exchange: Exchange): Array<{
  symbol: string;
  name: string;
  token?: string;
  lotSize: number;
  exchange: Exchange;
  hasOptions?: boolean;
}> {
  if (exchange === 'BSE') {
    return getAllBseCashStocks();
  }
  return getAllNseUnderlyings().map(u => ({
    symbol: u.symbol,
    name: u.name,
    token: u.cashToken || undefined,
    lotSize: 1,
    exchange: 'NSE' as const,
    hasOptions: true
  }));
}

/**
 * Gets underlying stock object by symbol and exchange.
 */
export function getUnderlyingBySymbolAndExchange(symbol: string, exchange: Exchange): UnderlyingStock {
  return exchange === 'BSE' ? getBseUnderlyingBySymbol(symbol) : getNseUnderlyingBySymbol(symbol);
}

/**
 * Gets valid expiries for stock on the selected exchange.
 */
export function getExpiriesForExchange(symbol: string, exchange: Exchange): string[] {
  return exchange === 'BSE' ? getBseAvailableExpiries(symbol) : getNseAvailableExpiries(symbol);
}

/**
 * Gets listed genuine strikes for stock on the selected exchange.
 * Never creates synthetic strikes.
 */
export function getListedStrikesForExchange(symbol: string, expiry: string, exchange: Exchange): number[] {
  return exchange === 'BSE' ? getBseListedStrikes(symbol, expiry) : getNseListedStrikes(symbol, expiry);
}

/**
 * Resolves option contract token for the selected exchange.
 * For NSE: NFO token
 * For BSE: BFO token
 */
export function resolveTokenForExchange(
  symbol: string,
  expiry: string,
  strike: number,
  optionType: OptionType,
  exchange: Exchange
): string {
  return exchange === 'BSE'
    ? resolveBseAngelToken(symbol, expiry, strike, optionType)
    : resolveNseAngelToken(symbol, expiry, strike, optionType);
}

/**
 * Resolves future contract token for the selected exchange.
 */
export function resolveFutTokenForExchange(
  symbol: string,
  expiry: string,
  exchange: Exchange
): string | null {
  return exchange === 'BSE'
    ? resolveBseAngelFutToken(symbol, expiry)
    : resolveNseAngelFutToken(symbol, expiry);
}

/**
 * Resolves cash stock token for the selected exchange.
 * For NSE: NSE cash token (exchangeType 1)
 * For BSE: BSE cash token (exchangeType 3)
 */
export function resolveCashTokenForExchange(symbol: string, exchange: Exchange): string | null {
  return exchange === 'BSE'
    ? resolveBseAngelCashToken(symbol)
    : resolveNseAngelCashToken(symbol);
}

/**
 * Formats Angel One Trading Symbol for the selected exchange.
 */
export function generateTradingSymbolForExchange(
  symbol: string,
  expiry: string,
  strike: number,
  optionType: OptionType,
  exchange: Exchange
): string {
  return exchange === 'BSE'
    ? generateBseTradingSymbol(symbol, expiry, strike, optionType)
    : generateNseTradingSymbol(symbol, expiry, strike, optionType);
}

/**
 * Calculates ATM strike for the selected exchange.
 */
export function getAtmStrikeForExchange(spot: number, strikes: number[], exchange: Exchange): number {
  return exchange === 'BSE' ? getBseAtmStrike(spot, strikes) : getNseAtmStrike(spot, strikes);
}

/**
 * Calculates days to expiry.
 */
export function getDaysToExpiryForExchange(expiryStr: string, exchange: Exchange): number {
  return exchange === 'BSE' ? getBseDaysToExpiry(expiryStr) : getNseDaysToExpiry(expiryStr);
}

/**
 * Formats expiry for display.
 */
export function formatExpiryForExchange(exp: string, exchange: Exchange): string {
  return exchange === 'BSE' ? formatBseExpiry(exp) : formatNseExpiry(exp);
}

/**
 * Normalizes expiry for keys.
 */
export function normalizeExpiryForExchange(exp: string, exchange: Exchange): string {
  return exchange === 'BSE' ? normalizeBseExpiry(exp) : normalizeNseExpiry(exp);
}

/**
 * Returns available sectors for the selected exchange.
 */
export function getAvailableSectorsForExchange(exchange: Exchange): string[] {
  return exchange === 'BSE' ? getBseAvailableSectors() : getNseAvailableSectors();
}
