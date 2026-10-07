import { DEFAULT_CREDENTIALS } from '../config/credentials';
import { generateTOTP } from './totp';

export class AngelSessionManager {
  private jwtToken: string | null = null;
  private feedToken: string | null = null;
  private refreshToken: string | null = null;
  private lastLoginTime: number = 0;
  private isLoggingIn: boolean = false;
  private lastLoginAttemptTime: number = 0;
  private minLoginIntervalMs: number = 30000;
  private sessionExpired: boolean = false;
  public credentials = { ...DEFAULT_CREDENTIALS };

  public isConnected(): boolean {
    return Boolean(
      this.jwtToken &&
      !this.sessionExpired &&
      Date.now() - this.lastLoginTime < 18 * 60 * 60 * 1000
    );
  }

  public isSessionExpired(): boolean {
    return this.sessionExpired;
  }

  public getValidJwt(): string | null {
    if (this.isConnected()) {
      return this.jwtToken;
    }
    return null;
  }

  public async login(force = false): Promise<boolean> {
    if (this.isLoggingIn) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return Boolean(this.jwtToken);
    }

    const now = Date.now();
    if (!force && this.lastLoginAttemptTime > 0 && now - this.lastLoginAttemptTime < this.minLoginIntervalMs) {
      console.warn(`[AngelOne] Login throttled: last attempt was ${Math.round((now - this.lastLoginAttemptTime) / 1000)}s ago. Cooldown is 30s.`);
      return false;
    }

    this.isLoggingIn = true;
    this.lastLoginAttemptTime = now;
    try {
      const totp = generateTOTP(this.credentials.totpSecret);
      const postData = JSON.stringify({
        clientcode: this.credentials.clientCode,
        password: this.credentials.pin,
        totp
      });

      const res = await fetch('https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '192.168.1.1',
          'X-ClientPublicIP': '106.51.72.100',
          'X-MACAddress': '02-00-00-00-00-00',
          'X-PrivateKey': this.credentials.apiKey
        },
        body: postData,
        signal: AbortSignal.timeout(8000)
      });

      const text = await res.text();
      let data: {
        status?: boolean;
        message?: string;
        data?: { jwtToken?: string; feedToken?: string; refreshToken?: string };
      } | null = null;

      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[AngelOne] Login returned non-JSON response (${res.status}): ${text.slice(0, 80)}`);
        this.sessionExpired = true;
        return false;
      }

      if (data && data.status && data.data?.jwtToken) {
        this.jwtToken = data.data.jwtToken;
        this.feedToken = data.data.feedToken || null;
        this.refreshToken = data.data.refreshToken || null;
        this.lastLoginTime = Date.now();
        this.sessionExpired = false;
        console.log('[AngelOne] Successfully logged in to SmartAPI.');
        return true;
      }

      this.sessionExpired = true;
      return false;
    } catch (err: any) {
      console.warn('[AngelOne] Login attempt error:', err?.message || err);
      this.sessionExpired = true;
      return false;
    } finally {
      this.isLoggingIn = false;
    }
  }

  public async fetchQuote(exchange: 'NSE' | 'NFO' | 'BSE' | 'BFO', tokens: string[]): Promise<unknown[]> {
    const jwt = this.getValidJwt();
    if (!jwt) {
      return [];
    }

    const uniqueTokens = Array.from(new Set(tokens.filter(t => Boolean(t && String(t).trim()))));
    if (uniqueTokens.length === 0) return [];

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueTokens.length; i += 50) {
      chunks.push(uniqueTokens.slice(i, i + 50));
    }

    const allFetched: unknown[] = [];

    await Promise.all(
      chunks.map(async chunk => {
        try {
          const makeRequest = async (token: string, timeoutMs = 8000) => {
            return await fetch('https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-UserType': 'USER',
                'X-SourceID': 'WEB',
                'X-ClientLocalIP': '192.168.1.1',
                'X-ClientPublicIP': '106.51.72.100',
                'X-MACAddress': '02-00-00-00-00-00',
                'X-PrivateKey': this.credentials.apiKey
              },
              body: JSON.stringify({
                mode: 'FULL',
                exchangeTokens: {
                  [exchange]: chunk
                }
              }),
              signal: AbortSignal.timeout(timeoutMs)
            });
          };

          let fetchRes: globalThis.Response | null = null;
          try {
            fetchRes = await makeRequest(jwt);
          } catch {
            await new Promise(r => setTimeout(r, 200));
            try {
              fetchRes = await makeRequest(jwt, 10000);
            } catch {
              fetchRes = null;
            }
          }

          if (!fetchRes) return;

          if (fetchRes.status === 401 || fetchRes.status === 403) {
            console.warn(`[AngelOne] Quote fetch returned ${fetchRes.status}: Session expired.`);
            this.jwtToken = null;
            this.sessionExpired = true;
            return;
          }

          if (fetchRes && fetchRes.ok) {
            const rawText = await fetchRes.text();
            let data: {
              status?: boolean;
              message?: string;
              errorcode?: string;
              data?: { fetched?: unknown[] };
            } | null = null;
            try {
              data = JSON.parse(rawText);
            } catch {
              data = null;
            }

            if (data && data.status && Array.isArray(data.data?.fetched)) {
              allFetched.push(...data.data.fetched);
            } else if (data && (data.errorcode === 'AG8001' || data.message?.toLowerCase().includes('token'))) {
              console.warn('[AngelOne] SmartAPI token expired code AG8001.');
              this.jwtToken = null;
              this.sessionExpired = true;
            }
          }
        } catch {
          // Gracefully continue with available chunks
        }
      })
    );

    return allFetched;
  }
}

export const angelSession = new AngelSessionManager();

// Attempt one initial background login on server start
setTimeout(() => {
  if (angelSession.credentials.apiKey && angelSession.credentials.clientCode) {
    angelSession.login().catch(() => {});
  }
}, 300);

export default angelSession;
