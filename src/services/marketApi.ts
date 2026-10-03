import { apiClient } from './api/apiClient';

export const marketApi = {
  async getStatus(): Promise<{ connected: boolean; clientCode?: string }> {
    return apiClient.get<{ connected: boolean; clientCode?: string }>('/api/angel/status');
  },

  async getQuotes(requestBody: {
    exchange: string;
    tokens: string[];
    cashToken?: string | null;
    futToken?: string | null;
  }): Promise<{
    success: boolean;
    data: Array<{
      symbolToken?: string | number;
      ltp?: number;
      tradingSymbol?: string;
      depth?: {
        buy?: Array<{ price?: number; quantity?: number; orders?: number }>;
        sell?: Array<{ price?: number; quantity?: number; orders?: number }>;
      };
      tradeVolume?: number;
      opnInterest?: number;
      open?: number;
      high?: number;
      low?: number;
      close?: number;
      avgPrice?: number;
    }>;
  }> {
    return apiClient.post<{
      success: boolean;
      data: any[];
    }>('/api/angel/quote', requestBody);
  }
};
export default marketApi;
