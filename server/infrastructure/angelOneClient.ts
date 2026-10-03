import { DEFAULT_CREDENTIALS } from '../config/credentials';
import { generateTOTP } from './totp';

export class AngelSessionManager {
  private jwtToken: string | null = null;
  private feedToken: string | null = null;
  private refreshToken: string | null = null;
  private lastLoginTime: number = 0;
  private isLoggingIn: boolean = false;
  public credentials = { ...DEFAULT_CREDENTIALS };

  public isConnected(): boolean {
    return Boolean(this.jwtToken && Date.now() - this.lastLoginTime < 18 * 60 * 60 * 1000);
  }

  public async getValidJwt(): Promise<string | null> {
    if (!this.isConnected()) {
      await this.login();
    }
    return this.jwtToken;
  }

  public async login(): Promise<boolean> {
    if (this.isLoggingIn) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Boolean(this.jwtToken);
    }

    this.isLoggingIn = true;
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
        body: postData
      });

      const data = (await res.json()) as {
        status?: boolean;
        data?: { jwtToken?: string; feedToken?: string; refreshToken?: string };
      };

      if (data.status && data.data?.jwtToken) {
        this.jwtToken = data.data.jwtToken;
        this.feedToken = data.data.feedToken || null;
        this.refreshToken = data.data.refreshToken || null;
        this.lastLoginTime = Date.now();
        console.log('[AngelOne] Successfully logged in to SmartAPI.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AngelOne] Login error:', err);
      return false;
    } finally {
      this.isLoggingIn = false;
    }
  }

  public async fetchQuote(exchange: 'NSE' | 'NFO' | 'BSE' | 'BFO', tokens: string[]): Promise<unknown[]> {
    let jwt = await this.getValidJwt();
    if (!jwt) {
      throw new Error('Unable to obtain valid SmartAPI session token');
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
            fetchRes = await makeRequest(jwt!);
          } catch {
            await new Promise(r => setTimeout(r, 200));
            try {
              fetchRes = await makeRequest(jwt!, 10000);
            } catch {
              fetchRes = null;
            }
          }

          if (!fetchRes) return;

          if (fetchRes.status === 401 || fetchRes.status === 403) {
            this.jwtToken = null;
            jwt = await this.getValidJwt();
            if (jwt) {
              try {
                fetchRes = await makeRequest(jwt, 8000);
              } catch {
                fetchRes = null;
              }
            }
          }

          if (fetchRes && fetchRes.ok) {
            const data = (await fetchRes.json()) as {
              status?: boolean;
              message?: string;
              errorcode?: string;
              data?: { fetched?: unknown[] };
            };

            if (data.status && Array.isArray(data.data?.fetched)) {
              allFetched.push(...data.data.fetched);
            } else if (data.errorcode === 'AG8001' || data.message?.toLowerCase().includes('token')) {
              this.jwtToken = null;
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
export default angelSession;
