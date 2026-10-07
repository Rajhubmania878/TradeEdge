import { angelSession } from '../../infrastructure/angelOneClient';

export class MarketService {
  public getStatus() {
    return {
      connected: angelSession.isConnected(),
      sessionExpired: angelSession.isSessionExpired(),
      clientCode: angelSession.credentials.clientCode,
      lastLogin: angelSession.isConnected(),
      mode: angelSession.isConnected() ? 'LIVE_SMARTAPI' : 'SIMULATED'
    };
  }

  public async loginBroker(credentials: {
    apiKey?: string;
    clientCode?: string;
    pin?: string;
    totpSecret?: string;
  }) {
    if (credentials.apiKey && credentials.clientCode && credentials.pin && credentials.totpSecret) {
      angelSession.credentials = {
        apiKey: credentials.apiKey,
        clientCode: credentials.clientCode,
        pin: credentials.pin,
        totpSecret: credentials.totpSecret
      };
    }
    const success = await angelSession.login();
    return {
      success,
      connected: angelSession.isConnected(),
      clientCode: angelSession.credentials.clientCode
    };
  }

  public async getQuotes(params: {
    exchange?: string;
    tokens?: string[];
    nseTokens?: string[];
    nfoTokens?: string[];
    bseTokens?: string[];
    bfoTokens?: string[];
  }): Promise<unknown[]> {
    const {
      exchange = 'NFO',
      tokens = [],
      nseTokens = [],
      nfoTokens = [],
      bseTokens = [],
      bfoTokens = []
    } = params;

    const allFetched: unknown[] = [];

    if (Array.isArray(nseTokens) && nseTokens.length > 0) {
      const fetched = await angelSession.fetchQuote('NSE', nseTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(nfoTokens) && nfoTokens.length > 0) {
      const fetched = await angelSession.fetchQuote('NFO', nfoTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(bseTokens) && bseTokens.length > 0) {
      const fetched = await angelSession.fetchQuote('BSE', bseTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(bfoTokens) && bfoTokens.length > 0) {
      const fetched = await angelSession.fetchQuote('BFO', bfoTokens);
      allFetched.push(...fetched);
    }
    if (
      Array.isArray(tokens) &&
      tokens.length > 0 &&
      nseTokens.length === 0 &&
      nfoTokens.length === 0 &&
      bseTokens.length === 0 &&
      bfoTokens.length === 0
    ) {
      const fetched = await angelSession.fetchQuote(exchange as 'NSE' | 'NFO' | 'BSE' | 'BFO', tokens);
      allFetched.push(...fetched);
    }

    return allFetched;
  }
}

export const marketService = new MarketService();
export default marketService;
