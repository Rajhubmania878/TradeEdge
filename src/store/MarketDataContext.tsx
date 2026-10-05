import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { OptionContract, MarketFeedMetrics } from '@/shared/types';
import { marketDataFeed } from '@/services/marketDataFeed';
import { useTerminal } from './TerminalContext';

interface MarketDataContextType {
  contracts: Map<string, OptionContract>;
  currentSpot: number;
  futurePrice: number;
  isStreaming: boolean;
  metrics: MarketFeedMetrics;
  toggleStreaming: () => void;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { symbol, expiry, exchange, strikeRange } = useTerminal();

  const [contracts, setContracts] = useState<Map<string, OptionContract>>(() => marketDataFeed.getContracts());
  const [currentSpot, setCurrentSpot] = useState<number>(() => marketDataFeed.getCurrentSpot());
  const [futurePrice, setFuturePrice] = useState<number>(() => marketDataFeed.getCurrentFuturePrice());
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  const [metrics, setMetrics] = useState<MarketFeedMetrics>(() => ({
    status: 'LIVE',
    angelConnected: true,
    isSimulated: false,
    lastTickTime: Date.now(),
    latencyMs: 24,
    dataAgeMs: 40,
    subscribedTokensCount: 60,
    ticksPerSecond: 6
  }));

  // Batched tick references using RAF micro-batching to prevent unthrottled context flooding
  const pendingContractsRef = useRef<Map<string, OptionContract> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastMetricsUpdateRef = useRef<number>(0);

  // Automatically initialize stock contracts and bind subscriptions when terminal parameters change
  useEffect(() => {
    marketDataFeed.initStockContracts(symbol, expiry, exchange, strikeRange);
    setContracts(new Map(marketDataFeed.getContracts()));
    setCurrentSpot(marketDataFeed.getCurrentSpot());
    setFuturePrice(marketDataFeed.getCurrentFuturePrice());

    const unsubTicks = marketDataFeed.subscribeTicks((updatedContracts) => {
      pendingContractsRef.current = updatedContracts;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingContractsRef.current) {
            setContracts(new Map(pendingContractsRef.current));
            setCurrentSpot(marketDataFeed.getCurrentSpot());
          }
          rafIdRef.current = null;
        });
      }
    });

    const unsubMetrics = marketDataFeed.subscribeMetrics((newMetrics) => {
      const now = Date.now();
      // Only trigger React state update if status changed or at least 2000ms elapsed
      if (now - lastMetricsUpdateRef.current >= 2000) {
        lastMetricsUpdateRef.current = now;
        setMetrics(newMetrics);
      }
    });

    const unsubSpotFut = marketDataFeed.subscribeSpotFut((newSpot, newFut) => {
      setCurrentSpot(newSpot);
      setFuturePrice(newFut);
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      unsubTicks();
      unsubMetrics();
      unsubSpotFut();
    };
  }, [symbol, expiry, exchange, strikeRange]);

  const toggleStreaming = React.useCallback(() => {
    setIsStreaming(prev => {
      const next = !prev;
      marketDataFeed.toggleStreaming(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    contracts,
    currentSpot,
    futurePrice,
    isStreaming,
    metrics,
    toggleStreaming
  }), [contracts, currentSpot, futurePrice, isStreaming, metrics, toggleStreaming]);

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};
