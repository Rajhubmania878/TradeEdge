const TOKEN_KEY = 'ratio_spread_auth_token';

class ApiClient {
  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((customHeaders as Record<string, string>) || {})
    };

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json() as T;
    } catch {
      return {} as T;
    }
  }

  public async get<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      method: 'GET',
      headers: this.getHeaders(options?.headers)
    });
    return this.handleResponse<T>(res);
  }

  public async post<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      method: 'POST',
      headers: this.getHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined
    });
    return this.handleResponse<T>(res);
  }

  public async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: this.getHeaders(options?.headers)
    });
    return this.handleResponse<T>(res);
  }

  public async put<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: this.getHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined
    });
    return this.handleResponse<T>(res);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
