import React, { useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { UnderlyingStock, Exchange } from '@/shared/types';
import {
  getUnderlyingsForExchange,
  getCashStocksForExchange,
  getAvailableSectorsForExchange
} from '@/data/universeManager';
import {
  Button,
  Input,
  Tag,
  Segmented,
  Empty,
  Divider,
  Flex
} from 'antd';
import {
  blue,
  cyan,
  gold,
  green,
  purple,
  magenta,
  volcano,
  orange,
  lime,
  geekblue
} from '@ant-design/colors';
import {
  SearchOutlined,
  DownOutlined,
  StarFilled,
  StarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  WarningOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined
} from '@ant-design/icons';

interface StockSelectorDropdownProps {
  selectedStock: UnderlyingStock;
  onSelectStock: (symbol: string) => void;
  exchange?: Exchange;
}

// Ant Design Semantic Color Definitions
type AntPresetColor = 'blue' | 'purple' | 'cyan' | 'green' | 'magenta' | 'pink' | 'red' | 'orange' | 'yellow' | 'volcano' | 'geekblue' | 'lime' | 'gold';

interface SectorStyleConfig {
  presetColor: AntPresetColor;
  primaryHex: string;
  label: string;
}

const SECTOR_COLOR_MAP: Record<string, SectorStyleConfig> = {
  ALL: { presetColor: 'blue', primaryHex: blue[5], label: 'All' },
  FAVORITES: { presetColor: 'gold', primaryHex: gold[5], label: 'Favorites' },
  RECENTS: { presetColor: 'cyan', primaryHex: cyan[5], label: 'Recent' },
  Automobile: { presetColor: 'volcano', primaryHex: volcano[5], label: 'Automobile' },
  'Banking & Financial Services': { presetColor: 'purple', primaryHex: purple[5], label: 'Banking & Financials' },
  'Information Technology': { presetColor: 'geekblue', primaryHex: geekblue[5], label: 'IT' },
  'Oil, Gas & Consumable Fuels': { presetColor: 'orange', primaryHex: orange[5], label: 'Oil & Gas' },
  'Fast Moving Consumer Goods': { presetColor: 'magenta', primaryHex: magenta[5], label: 'FMCG' },
  Healthcare: { presetColor: 'green', primaryHex: green[5], label: 'Healthcare' },
  'Metals & Mining': { presetColor: 'lime', primaryHex: lime[5], label: 'Metals & Mining' },
  Chemicals: { presetColor: 'cyan', primaryHex: cyan[6], label: 'Chemicals' },
  'Capital Goods': { presetColor: 'blue', primaryHex: blue[6], label: 'Capital Goods' },
  'Consumer Durables': { presetColor: 'magenta', primaryHex: magenta[6], label: 'Consumer Durables' },
  Power: { presetColor: 'gold', primaryHex: gold[6], label: 'Power & Energy' },
  Construction: { presetColor: 'volcano', primaryHex: volcano[6], label: 'Construction' },
  Telecommunication: { presetColor: 'purple', primaryHex: purple[6], label: 'Telecom' },
  Services: { presetColor: 'geekblue', primaryHex: geekblue[6], label: 'Services' }
};

const PRESET_CYCLE: { presetColor: AntPresetColor; primaryHex: string }[] = [
  { presetColor: 'blue', primaryHex: blue[5] },
  { presetColor: 'green', primaryHex: green[5] },
  { presetColor: 'purple', primaryHex: purple[5] },
  { presetColor: 'volcano', primaryHex: volcano[5] },
  { presetColor: 'cyan', primaryHex: cyan[5] },
  { presetColor: 'magenta', primaryHex: magenta[5] },
  { presetColor: 'gold', primaryHex: gold[5] },
  { presetColor: 'lime', primaryHex: lime[5] },
  { presetColor: 'geekblue', primaryHex: geekblue[5] },
  { presetColor: 'orange', primaryHex: orange[5] }
];

const getSectorConfig = (key: string): SectorStyleConfig => {
  if (SECTOR_COLOR_MAP[key]) {
    return SECTOR_COLOR_MAP[key];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const cycleItem = PRESET_CYCLE[Math.abs(hash) % PRESET_CYCLE.length];
  return {
    presetColor: cycleItem.presetColor,
    primaryHex: cycleItem.primaryHex,
    label: key
  };
};

interface StockItemRowProps {
  stockItem: UnderlyingStock | any;
  isSelected: boolean;
  isHighlighted: boolean;
  isFav: boolean;
  exchange: Exchange;
  onSelect: (sym: string) => void;
  onToggleFav: (e: React.MouseEvent, sym: string) => void;
}

const StockItemRow = React.memo<StockItemRowProps>(({
  stockItem,
  isSelected,
  isHighlighted,
  isFav,
  exchange,
  onSelect,
  onToggleFav
}) => {
  const hasOpts = (stockItem as UnderlyingStock).expiries !== undefined || (stockItem as { hasOptions?: boolean }).hasOptions;
  const rawName = stockItem.name || '';
  
  // Fast string prefix check without compiling dynamic RegExp per item
  const cleanCompanyName = useMemo(() => {
    if (!rawName) return '';
    const sym = stockItem.symbol;
    if (rawName.toUpperCase().startsWith(sym.toUpperCase())) {
      return rawName.slice(sym.length).replace(/^[\s\-·:]+/, '').trim();
    }
    return rawName;
  }, [rawName, stockItem.symbol]);

  const sectorName = (stockItem as UnderlyingStock).sector || '';

  return (
    <div
      data-stock-item
      onClick={() => onSelect(stockItem.symbol)}
      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800/80'
          : isHighlighted
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-slate-700'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={e => onToggleFav(e, stockItem.symbol)}
          className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
            isFav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFav ? <StarFilled className="text-base" /> : <StarOutlined className="text-base" />}
        </button>

        {/* Stock Symbol, Company & Sector info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-900 dark:text-white font-mono tracking-tight">
              {stockItem.symbol}
            </span>
            {isSelected && (
              <Tag color="success" className="m-0 text-[10px] font-semibold py-0.5 px-1.5 border-0">
                CURRENT
              </Tag>
            )}
            {hasOpts ? (
              <Tag color="cyan" className="m-0 text-[10px] font-mono font-medium py-0.5 px-1.5 border-0">
                {exchange} F&O
              </Tag>
            ) : (
              <Tag className="m-0 text-[10px] font-mono py-0.5 px-1.5 border-0 bg-slate-100 dark:bg-slate-800 text-slate-500">
                Cash
              </Tag>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
            {cleanCompanyName && cleanCompanyName !== stockItem.symbol ? (
              <span className="truncate">{cleanCompanyName}</span>
            ) : null}
            {sectorName ? (
              <>
                {cleanCompanyName && cleanCompanyName !== stockItem.symbol ? <span>·</span> : null}
                <span className="text-slate-500 dark:text-slate-400 font-medium">{sectorName}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stock Price & Lot/Step Metadata */}
      <div className="text-right font-mono shrink-0 ml-4">
        {'spotPrice' in stockItem && (
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            ₹{stockItem.spotPrice.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
        )}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1.5 tabular-nums mt-0.5">
          <span>Lot: <strong className="text-slate-700 dark:text-slate-300 font-medium">{stockItem.lotSize}</strong></span>
          {'strikeStep' in stockItem && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Step: <strong className="text-emerald-600 dark:text-emerald-400 font-medium">₹{(stockItem as UnderlyingStock).strikeStep}</strong></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export const StockSelectorDropdown: React.FC<StockSelectorDropdownProps> = ({
  selectedStock,
  onSelectStock,
  exchange = 'NSE'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [bseUniverseTab, setBseUniverseTab] = useState<'OPTIONS' | 'CASH'>('OPTIONS');
  const [cashWarning, setCashWarning] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(60);

  const favKey = `${exchange.toLowerCase()}_favorite_stocks`;
  const recentKey = `${exchange.toLowerCase()}_recent_stocks`;

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(favKey);
      return stored
        ? JSON.parse(stored)
        : ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'ADANIENT'];
    } catch {
      return ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'ADANIENT'];
    }
  });

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(recentKey);
      return stored
        ? JSON.parse(stored)
        : ['RELIANCE', 'ADANIENT', 'TCS', 'SBIN', 'HDFCBANK'];
    } catch {
      return ['RELIANCE', 'ADANIENT', 'TCS', 'SBIN', 'HDFCBANK'];
    }
  });

  useEffect(() => {
    try {
      const storedFav = localStorage.getItem(favKey);
      if (storedFav) setFavorites(JSON.parse(storedFav));
      const storedRec = localStorage.getItem(recentKey);
      if (storedRec) setRecents(JSON.parse(storedRec));
    } catch {
      // ignore
    }
    setBseUniverseTab('OPTIONS');
    setCashWarning(null);
  }, [exchange, favKey, recentKey]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Enable vertical-to-horizontal mousewheel scrolling on Category & Sector Tabs
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isOpen, bseUniverseTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 || e.deltaX !== 0) {
      e.stopPropagation();
      if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
      }
    }
  };

  const optionUnderlyings = useMemo(() => getUnderlyingsForExchange(exchange), [exchange]);
  const optionUnderlyingsSet = useMemo(() => new Set(optionUnderlyings.map(u => u.symbol.toUpperCase())), [optionUnderlyings]);
  const cashStocks = useMemo(() => getCashStocksForExchange(exchange), [exchange]);
  const availableSectors = useMemo(() => ['ALL', ...getAvailableSectorsForExchange(exchange)], [exchange]);

  const filteredStocks = useMemo(() => {
    if (!isOpen) {
      return [];
    }

    const q = deferredSearch.trim().toLowerCase();

    if (exchange === 'BSE' && bseUniverseTab === 'CASH') {
      return cashStocks.filter(stock => {
        if (!q) return true;
        return (
          stock.symbol.toLowerCase().includes(q) ||
          stock.name.toLowerCase().includes(q)
        );
      });
    }

    return optionUnderlyings.filter(stock => {
      if (selectedSector === 'FAVORITES') {
        if (!favorites.includes(stock.symbol)) return false;
      } else if (selectedSector === 'RECENTS') {
        if (!recents.includes(stock.symbol)) return false;
      } else if (selectedSector !== 'ALL' && stock.sector !== selectedSector) {
        return false;
      }

      if (!q) return true;
      return (
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q)
      );
    });
  }, [isOpen, exchange, bseUniverseTab, optionUnderlyings, cashStocks, deferredSearch, selectedSector, favorites, recents]);

  // Sliced display list for high-performance rendering
  const displayedStocks = useMemo(() => {
    return filteredStocks.slice(0, displayCount);
  }, [filteredStocks, displayCount]);

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150 && displayCount < filteredStocks.length) {
      setDisplayCount(prev => Math.min(prev + 40, filteredStocks.length));
    }
  };

  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const popupWidth = popupRef.current
        ? popupRef.current.getBoundingClientRect().width
        : Math.min(window.innerWidth - 32, 580);

      let left = rect.left;
      if (left + popupWidth > window.innerWidth - 16) {
        left = window.innerWidth - popupWidth - 16;
      }
      if (left < 16) left = 16;

      let top = rect.bottom + 6;
      const popupHeight = popupRef.current
        ? popupRef.current.getBoundingClientRect().height
        : 500;

      if (top + popupHeight > window.innerHeight - 16 && rect.top - popupHeight - 6 > 16) {
        top = Math.max(16, rect.top - popupHeight - 6);
      } else if (top + popupHeight > window.innerHeight - 16) {
        top = Math.max(16, window.innerHeight - popupHeight - 16);
      }

      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const raf = requestAnimationFrame(() => {
        updatePosition();
      });
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(-1);
      setCashWarning(null);
      setDisplayCount(60);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
    setDisplayCount(60);
  }, [deferredSearch, selectedSector, bseUniverseTab]);

  const toggleFavorite = React.useCallback((e: React.MouseEvent, sym: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym];
      try {
        localStorage.setItem(favKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [favKey]);

  const handleSelect = React.useCallback((sym: string) => {
    const isOptionable = optionUnderlyingsSet.has(sym.toUpperCase());

    if (!isOptionable && exchange === 'BSE') {
      setCashWarning(`"${sym}" is listed in BSE Cash only (no BSE option contracts). Select an equity from the BSE F&O universe.`);
      return;
    }

    onSelectStock(sym);
    setIsOpen(false);

    setRecents(prev => {
      const updated = [sym, ...prev.filter(s => s !== sym)].slice(0, 8);
      try {
        localStorage.setItem(recentKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [exchange, onSelectStock, optionUnderlyingsSet, recentKey]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev < displayedStocks.length - 1 ? prev + 1 : 0;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev > 0 ? prev - 1 : displayedStocks.length - 1;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && displayedStocks[selectedIndex]) {
        handleSelect(displayedStocks[selectedIndex].symbol);
      } else if (displayedStocks.length > 0 && searchQuery.trim()) {
        handleSelect(displayedStocks[0].symbol);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const scrollActiveIntoView = (index: number) => {
    if (!listRef.current || index < 0) return;
    const items = listRef.current.querySelectorAll('[data-stock-item]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <Button
        size="middle"
        onClick={() => setIsOpen(!isOpen)}
        className="font-mono flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-all shadow-xs rounded-lg max-w-[140px] sm:max-w-none"
      >
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider hidden xl:inline">EQUITY:</span>
        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{selectedStock.symbol}</span>
        <Tag color="cyan" className="m-0 text-[10px] font-mono font-semibold py-0.5 px-1 border-0 sm:hidden">
          {exchange}
        </Tag>
        <DownOutlined className={`text-xs text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && coords && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 99999
          }}
          className="w-[calc(100vw-32px)] sm:w-[540px] md:w-[580px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] sm:max-h-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col antialiased animate-in fade-in zoom-in-95 duration-100"
        >
          {exchange === 'BSE' && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
              <Segmented
                value={bseUniverseTab}
                onChange={val => {
                  setBseUniverseTab(val as any);
                  setCashWarning(null);
                }}
                options={[
                  { label: `BSE Option Underlyings (${optionUnderlyings.length})`, value: 'OPTIONS' },
                  { label: `BSE Cash Universe (${cashStocks.length}+)`, value: 'CASH' }
                ]}
                block
                size="small"
              />
            </div>
          )}

          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <Input
              ref={searchInputRef}
              prefix={<SearchOutlined className="text-slate-400 mr-2 text-base" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${exchange} symbol or company name...`}
              allowClear
              size="middle"
              className="font-sans text-sm rounded-xl h-10"
            />
          </div>

          {/* Cash Warning */}
          {cashWarning && (
            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
              <WarningOutlined className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{cashWarning}</div>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setCashWarning(null)}
                className="text-amber-600 dark:text-amber-400 p-0 h-auto"
              />
            </div>
          )}

          {/* Category & Sector Tabs with Large High-Contrast Tabs and Smooth Scroll */}
          {bseUniverseTab === 'OPTIONS' && (
            <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 py-1">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="px-3 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 z-10 transition-colors cursor-pointer shrink-0 border-r border-slate-200 dark:border-slate-800"
                title="Scroll Left"
              >
                <LeftOutlined className="text-sm font-bold" />
              </button>

              {/* Scrollable Tabs Track */}
              <div
                ref={tabsContainerRef}
                onWheel={handleTabsWheel}
                className="flex items-center gap-3 px-3 py-2.5 overflow-x-auto text-sm flex-1 no-scrollbar select-none scroll-smooth"
              >
                {/* ALL */}
                <Tag
                  color={selectedSector === 'ALL' ? 'blue' : undefined}
                  onClick={() => setSelectedSector('ALL')}
                  className={`cursor-pointer m-0 px-4.5 py-2 text-[13.5px] font-semibold rounded-full transition-all border flex items-center gap-2 shrink-0 select-none ${
                    selectedSector === 'ALL'
                      ? 'shadow-md font-extrabold text-white scale-[1.03] ring-2 ring-blue-500/50 dark:ring-blue-400/50 bg-blue-600'
                      : 'text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/70 font-medium'
                  }`}
                >
                  {selectedSector === 'ALL' && <CheckOutlined className="text-xs mr-0.5" />}
                  <span>All ({optionUnderlyings.length})</span>
                </Tag>

                {/* FAVORITES */}
                <Tag
                  color={selectedSector === 'FAVORITES' ? 'gold' : undefined}
                  onClick={() => setSelectedSector('FAVORITES')}
                  className={`cursor-pointer m-0 px-4.5 py-2 text-[13.5px] font-semibold rounded-full transition-all border flex items-center gap-2 shrink-0 select-none ${
                    selectedSector === 'FAVORITES'
                      ? 'shadow-md font-extrabold text-white scale-[1.03] ring-2 ring-amber-500/50 dark:ring-amber-400/50 bg-amber-500'
                      : 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 font-medium'
                  }`}
                >
                  <StarFilled className={selectedSector === 'FAVORITES' ? 'text-white text-sm' : 'text-amber-500 text-sm'} />
                  <span>Favorites ({favorites.length})</span>
                </Tag>

                {/* RECENTS */}
                <Tag
                  color={selectedSector === 'RECENTS' ? 'cyan' : undefined}
                  onClick={() => setSelectedSector('RECENTS')}
                  className={`cursor-pointer m-0 px-4.5 py-2 text-[13.5px] font-semibold rounded-full transition-all border flex items-center gap-2 shrink-0 select-none ${
                    selectedSector === 'RECENTS'
                      ? 'shadow-md font-extrabold text-white scale-[1.03] ring-2 ring-teal-500/50 dark:ring-teal-400/50 bg-teal-600'
                      : 'text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800 bg-teal-50/90 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/70 font-medium'
                  }`}
                >
                  <ClockCircleOutlined className={selectedSector === 'RECENTS' ? 'text-white text-sm' : 'text-teal-500 text-sm'} />
                  <span>Recent</span>
                </Tag>

                <Divider vertical className="bg-slate-300 dark:bg-slate-700 h-7 my-auto mx-1 shrink-0" />

                {/* SECTORS */}
                {availableSectors.filter(s => s !== 'ALL').map(sec => {
                  const config = getSectorConfig(sec);
                  const isSelected = selectedSector === sec;

                  return (
                    <Tag
                      key={sec}
                      color={isSelected ? config.presetColor : undefined}
                      onClick={() => setSelectedSector(sec)}
                      className={`cursor-pointer m-0 px-4.5 py-2 text-[13.5px] font-semibold rounded-full transition-all border flex items-center gap-2.5 shrink-0 select-none ${
                        isSelected
                          ? 'shadow-md font-extrabold text-white scale-[1.03] ring-2 ring-slate-400/50'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 font-medium'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: isSelected ? '#ffffff' : config.primaryHex }}
                      />
                      <span>{config.label}</span>
                    </Tag>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="px-3 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 z-10 transition-colors cursor-pointer shrink-0 border-l border-slate-200 dark:border-slate-800"
                title="Scroll Right"
              >
                <RightOutlined className="text-sm font-bold" />
              </button>
            </div>
          )}

          {/* Stock List Items with Infinite Slice Rendering */}
          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="overflow-y-auto max-h-[350px] divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5 font-sans slim-scrollbar"
          >
            {displayedStocks.length === 0 ? (
              <div className="py-12 text-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-slate-500 text-xs font-sans">
                      No {exchange} equities match &quot;{searchQuery}&quot;
                    </span>
                  }
                />
              </div>
            ) : (
              displayedStocks.map((stockItem, idx) => (
                <StockItemRow
                  key={stockItem.symbol}
                  stockItem={stockItem}
                  isSelected={stockItem.symbol === selectedStock.symbol}
                  isHighlighted={idx === selectedIndex && selectedIndex !== -1}
                  isFav={favorites.includes(stockItem.symbol)}
                  exchange={exchange}
                  onSelect={handleSelect}
                  onToggleFav={toggleFavorite}
                />
              ))
            )}
          </div>

          {/* Clean Ant Design Footer with Non-Stretching Keyboard Badges */}
          <div className="px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-sans">
            <Flex align="center" gap={6} className="font-mono text-xs">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs leading-none">
                ↑
              </span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs leading-none">
                ↓
              </span>
              <span className="text-[11px] text-slate-500">navigate</span>
              <span className="text-slate-300 dark:text-slate-700 mx-0.5">·</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs leading-none">
                ↵
              </span>
              <span className="text-[11px] text-slate-500">select</span>
              <span className="text-slate-300 dark:text-slate-700 mx-0.5">·</span>
              <span className="inline-flex items-center justify-center px-1.5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs leading-none">
                esc
              </span>
            </Flex>

            <div className="font-mono text-[11px]">
              <span className="text-slate-400">{exchange} Underlyings:</span> <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{optionUnderlyings.length}</strong>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};



