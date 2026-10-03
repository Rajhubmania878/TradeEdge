import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Exchange,
  OptionType,
  GapMode,
  DirectionMode,
  ReferenceStrikeMode,
  RatioStrategyRow,
  ScannerFilterConfig,
  SortField,
  SortDirection,
  UnderlyingStock,
  SavedPreset
} from '@/shared/types';
import {
  getUnderlyingBySymbolAndExchange,
  getExpiriesForExchange
} from '@/data';
import { marketDataFeed } from '@/services/marketDataFeed';

export type MainTabType = 'MATRIX' | 'ALL_RATIOS' | 'OPTION_CHAIN' | 'SCANNER';

interface TerminalContextType {
  // Navigation & Overlays
  activeTab: MainTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<MainTabType>>;
  isAngelModalOpen: boolean;
  setIsAngelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTestModalOpen: boolean;
  setIsTestModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showSettingsOverlay: boolean;
  setShowSettingsOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  showAdminOverlay: boolean;
  setShowAdminOverlay: React.Dispatch<React.SetStateAction<boolean>>;

  // Focus & Display Controls
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  density: 'compact' | 'comfortable';
  setDensity: React.Dispatch<React.SetStateAction<'compact' | 'comfortable'>>;
  showAdvancedData: boolean;
  setShowAdvancedData: React.Dispatch<React.SetStateAction<boolean>>;

  // Core Symbol & Exchange Parameters
  exchange: Exchange;
  symbol: string;
  stock: UnderlyingStock;
  expiry: string;
  setExpiry: React.Dispatch<React.SetStateAction<string>>;
  optionType: OptionType;
  setOptionType: React.Dispatch<React.SetStateAction<OptionType>>;
  direction: DirectionMode;
  setDirection: React.Dispatch<React.SetStateAction<DirectionMode>>;

  // Ratios & Spreadsheet parameters
  ratioLong: number;
  setRatioLong: React.Dispatch<React.SetStateAction<number>>;
  ratioShort: number;
  setRatioShort: React.Dispatch<React.SetStateAction<number>>;
  gap: number;
  setGap: React.Dispatch<React.SetStateAction<number>>;
  cnt: number;
  setCnt: React.Dispatch<React.SetStateAction<number>>;
  stk: string | number;
  setStk: React.Dispatch<React.SetStateAction<string | number>>;
  minStrike: number | 'ALL';
  setMinStrike: React.Dispatch<React.SetStateAction<number | 'ALL'>>;
  maxStrike: number | 'ALL';
  setMaxStrike: React.Dispatch<React.SetStateAction<number | 'ALL'>>;

  // Scanner parameters
  gapMode: GapMode;
  setGapMode: React.Dispatch<React.SetStateAction<GapMode>>;
  gapSteps: number;
  setGapSteps: React.Dispatch<React.SetStateAction<number>>;
  targetPriceGap: number;
  setTargetPriceGap: React.Dispatch<React.SetStateAction<number>>;
  strikeRange: number;
  setStrikeRange: React.Dispatch<React.SetStateAction<number>>;
  referenceMode: ReferenceStrikeMode;
  setReferenceMode: React.Dispatch<React.SetStateAction<ReferenceStrikeMode>>;
  pricingMode: 'EXECUTABLE' | 'MID' | 'CONSERVATIVE';
  setPricingMode: React.Dispatch<React.SetStateAction<'EXECUTABLE' | 'MID' | 'CONSERVATIVE'>>;

  // Scanner Filtering & Sorting
  filter: ScannerFilterConfig;
  setFilter: React.Dispatch<React.SetStateAction<ScannerFilterConfig>>;
  sortField: SortField;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;

  // Toast notifications & selections
  stockSwitchToast: string | null;
  setStockSwitchToast: React.Dispatch<React.SetStateAction<string | null>>;
  selectedStrategyRow: RatioStrategyRow | null;
  setSelectedStrategyRow: React.Dispatch<React.SetStateAction<RatioStrategyRow | null>>;

  // Presets
  savedPresets: SavedPreset[];
  setSavedPresets: React.Dispatch<React.SetStateAction<SavedPreset[]>>;

  // Actions
  selectExchange: (newExchange: Exchange) => void;
  selectStock: (newSymbol: string) => void;
  resetStockConfig: () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MainTabType>('MATRIX');
  const [isAngelModalOpen, setIsAngelModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
  const [showAdminOverlay, setShowAdminOverlay] = useState(false);

  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [showAdvancedData, setShowAdvancedData] = useState<boolean>(false);

  const [exchange, setExchange] = useState<Exchange>('NSE');
  const [symbol, setSymbol] = useState<string>('RELIANCE');

  const stock = useMemo(() => getUnderlyingBySymbolAndExchange(symbol, exchange), [symbol, exchange]);

  const [expiry, setExpiry] = useState<string>(() => {
    const s = getUnderlyingBySymbolAndExchange('RELIANCE', 'NSE');
    const oct = s.expiries.find(e => e.toLowerCase().includes('oct'));
    return oct || s.expiries[0] || '27-Oct-2026';
  });

  const [optionType, setOptionType] = useState<OptionType>('CE');
  const [direction, setDirection] = useState<DirectionMode>('NORMAL');

  const [ratioLong, setRatioLong] = useState<number>(1);
  const [ratioShort, setRatioShort] = useState<number>(3);

  const [gap, setGap] = useState<number>(() => (stock.strikeStep <= 20 ? 20 : 50));
  const [cnt, setCnt] = useState<number>(5);
  const [stk, setStk] = useState<string | number>('AUTO');
  const [minStrike, setMinStrike] = useState<number | 'ALL'>('ALL');
  const [maxStrike, setMaxStrike] = useState<number | 'ALL'>('ALL');

  const [gapMode, setGapMode] = useState<GapMode>('STRIKE_STEPS');
  const [gapSteps, setGapSteps] = useState<number>(2);
  const [targetPriceGap, setTargetPriceGap] = useState<number>(50);
  const [strikeRange, setStrikeRange] = useState<number>(15);
  const [referenceMode, setReferenceMode] = useState<ReferenceStrikeMode>('ATM');
  const [pricingMode, setPricingMode] = useState<'EXECUTABLE' | 'MID' | 'CONSERVATIVE'>('EXECUTABLE');

  const [filter, setFilter] = useState<ScannerFilterConfig>({
    netType: 'ALL',
    minOi: 0,
    minVolume: 0,
    maxSpreadPct: 50,
    minMaxProfit: 0,
    minDelta: -1,
    maxDelta: 1,
    searchQuery: ''
  });

  const [sortField, setSortField] = useState<SortField>('netEntry');
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');

  const [stockSwitchToast, setStockSwitchToast] = useState<string | null>(null);
  const [selectedStrategyRow, setSelectedStrategyRow] = useState<RatioStrategyRow | null>(null);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  // Reset core strike gap defaults if exchange/symbol changes manually
  const selectExchange = (newExchange: Exchange) => {
    if (newExchange === exchange) return;
    setExchange(newExchange);

    const validUnderlying = getUnderlyingBySymbolAndExchange(symbol, newExchange);
    const targetSymbol = validUnderlying.symbol || 'RELIANCE';
    setSymbol(targetSymbol);

    const validExpiries = getExpiriesForExchange(targetSymbol, newExchange);
    const validExpiry = validExpiries.includes(expiry)
      ? expiry
      : (validExpiries.find(e => e.toLowerCase().includes('oct')) || validExpiries[0] || '29-Oct-2026');
    setExpiry(validExpiry);

    const newStep = validUnderlying.strikeStep;
    const defaultGap = newStep <= 10 ? newStep * 2 : newStep;
    setGap(defaultGap);
    setStk('AUTO');
    setMinStrike('ALL');
    setMaxStrike('ALL');
    setSelectedStrategyRow(null);

    marketDataFeed.switchExchange(newExchange);

    setStockSwitchToast(`EXCHANGE [ ${newExchange} ] · ${targetSymbol} · Lot ${validUnderlying.lotSize}`);
    setTimeout(() => setStockSwitchToast(null), 2500);
  };

  const selectStock = (newSymbol: string) => {
    const newStock = getUnderlyingBySymbolAndExchange(newSymbol, exchange);
    setSymbol(newSymbol);

    const validExpiries = getExpiriesForExchange(newSymbol, exchange);
    const validExpiry = validExpiries.includes(expiry)
      ? expiry
      : (validExpiries.find(e => e.toLowerCase().includes('oct')) || validExpiries[0] || '29-Oct-2026');
    setExpiry(validExpiry);

    const newStep = newStock.strikeStep;
    const defaultGap = newStep <= 10 ? newStep * 2 : newStep;
    setGap(defaultGap);
    setStk('AUTO');
    setMinStrike('ALL');
    setMaxStrike('ALL');
    setSelectedStrategyRow(null);

    marketDataFeed.initStockContracts(newSymbol, validExpiry, exchange, strikeRange);

    setStockSwitchToast(`[${exchange}] Switched to ${newSymbol} · Lot ${newStock.lotSize} · Step ₹${newStep}`);
    setTimeout(() => setStockSwitchToast(null), 2500);
  };

  const resetStockConfig = () => {
    setGap(stock.strikeStep <= 20 ? 20 : 50);
    setCnt(5);
    setStk('AUTO');
    setMinStrike('ALL');
    setMaxStrike('ALL');
  };

  return (
    <TerminalContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAngelModalOpen,
        setIsAngelModalOpen,
        isTestModalOpen,
        setIsTestModalOpen,
        showSettingsOverlay,
        setShowSettingsOverlay,
        showAdminOverlay,
        setShowAdminOverlay,
        isFocusMode,
        setIsFocusMode,
        isFullscreen,
        setIsFullscreen,
        density,
        setDensity,
        showAdvancedData,
        setShowAdvancedData,
        exchange,
        symbol,
        stock,
        expiry,
        setExpiry,
        optionType,
        setOptionType,
        direction,
        setDirection,
        ratioLong,
        setRatioLong,
        ratioShort,
        setRatioShort,
        gap,
        setGap,
        cnt,
        setCnt,
        stk,
        setStk,
        minStrike,
        setMinStrike,
        maxStrike,
        setMaxStrike,
        gapMode,
        setGapMode,
        gapSteps,
        setGapSteps,
        targetPriceGap,
        setTargetPriceGap,
        strikeRange,
        setStrikeRange,
        referenceMode,
        setReferenceMode,
        pricingMode,
        setPricingMode,
        filter,
        setFilter,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        stockSwitchToast,
        setStockSwitchToast,
        selectedStrategyRow,
        setSelectedStrategyRow,
        savedPresets,
        setSavedPresets,
        selectExchange,
        selectStock,
        resetStockConfig
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
