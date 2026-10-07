import React, { useMemo, useEffect } from 'react';
import {
  Exchange,
  OptionType,
  GapMode,
  DirectionMode,
  ReferenceStrikeMode,
  RatioStrategyRow,
  MarketFeedMetrics,
  ScannerFilterConfig,
  SortField,
  SortDirection,
  StrategyLeg,
  StockMarketSummary,
  SavedPreset
} from '@/shared/types';
import { useAuth } from '@/store/AuthContext';
import { useTerminal, TerminalProvider } from '@/store/TerminalContext';
import { useMarketData, MarketDataProvider } from '@/store/MarketDataContext';
import {
  getListedStrikesForExchange,
  getAtmStrikeForExchange,
  resolveTokenForExchange,
  getDaysToExpiryForExchange
} from '@/data';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { oiTracker } from '@/engine/oiTracker';
import { marketDataFeed } from '@/services/marketDataFeed';
import { authService } from '@/services/authService';

// Components
import { TerminalLayout, MainTabType } from '@/app/layouts/TerminalLayout';
import { ProCard } from '@ant-design/pro-components';
import { StatusBar } from '@/shared/components/feedback/StatusBar';
import { LoadingScreen } from '@/shared/components/feedback/LoadingScreen';
import { MarketSnapshotStrip, AngelOneModal } from '@/features/market-feed';
import { RatioMatrixSpreadsheet, StrategyControlBar } from '@/features/ratio-matrix';
import { AllRatiosScanner } from '@/features/all-ratios';
import { UnitTestsModal } from '@/shared/components/feedback/UnitTestsModal';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AdminPage } from '@/pages/admin/AdminPage';

// Lazy load secondary non-default scanner panels and dual option chain views
const ControlsPanel = React.lazy(() => import('@/features/spread-scanner').then(m => ({ default: m.ControlsPanel })));
const FilterToolbar = React.lazy(() => import('@/features/spread-scanner').then(m => ({ default: m.FilterToolbar })));
const RatioSpreadGrid = React.lazy(() => import('@/features/spread-scanner').then(m => ({ default: m.RatioSpreadGrid })));
const OptionChainDualView = React.lazy(() => import('@/features/option-chain').then(m => ({ default: m.OptionChainDualView })));
const SelectedStrategyPanel = React.lazy(() => import('@/features/user-strategies').then(m => ({ default: m.SelectedStrategyPanel })));

const MainTerminalContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const terminal = useTerminal();
  const marketData = useMarketData();

  // Destructure state and actions from terminal store
  const {
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
    maxVisibleRows,
    setMaxVisibleRows,
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
    selectedStrategyRow,
    setSelectedStrategyRow,
    savedPresets,
    setSavedPresets,
    selectExchange,
    selectStock,
    resetStockConfig
  } = terminal;

  // Destructure from marketData store
  const {
    contracts,
    currentSpot,
    futurePrice,
    isStreaming,
    metrics,
    toggleStreaming
  } = marketData;

  // Derivations
  const allListedStrikes = useMemo(() => getListedStrikesForExchange(symbol, expiry, exchange), [symbol, expiry, exchange]);
  const atmStrike = useMemo(() => getAtmStrikeForExchange(currentSpot, allListedStrikes, exchange), [currentSpot, allListedStrikes, exchange]);

  const stockSummary: StockMarketSummary = useMemo(() => {
    const atmTokenCE = resolveTokenForExchange(symbol, expiry, atmStrike, 'CE', exchange);
    const atmTokenPE = resolveTokenForExchange(symbol, expiry, atmStrike, 'PE', exchange);
    const atmCE = contracts.get(atmTokenCE);
    const atmPE = contracts.get(atmTokenPE);

    const ceLtp = atmCE?.ltp || 0;
    const peLtp = atmPE?.ltp || 0;
    const straddle = Math.round((ceLtp + peLtp) * 100) / 100;
    const straddlePct = Math.round((straddle / currentSpot) * 1000) / 10;

    const futurePriceVal = futurePrice > 0 ? futurePrice : Math.round(currentSpot * 1.004 * 20) / 20;
    const basis = Math.round((futurePriceVal - currentSpot) * 100) / 100;
    const dte = Math.round(getDaysToExpiryForExchange(expiry, exchange));

    return {
      cash: currentSpot,
      future: futurePriceVal,
      basis,
      atm: atmStrike,
      atmStraddle: straddle,
      atmStraddlePct: straddlePct,
      dte
    };
  }, [symbol, expiry, atmStrike, contracts, currentSpot, futurePrice, exchange]);

  const availableStrikesCount = useMemo(() => {
    const atmIdx = allListedStrikes.indexOf(atmStrike);
    if (atmIdx === -1) return { below: 15, above: 15 };
    return {
      below: atmIdx,
      above: allListedStrikes.length - 1 - atmIdx
    };
  }, [allListedStrikes, atmStrike]);

  const handleSavePreset = async () => {
    if (!currentUser) return;
    try {
      const saved = await authService.saveStrategy({
        name: `${symbol} ${ratioLong}:${ratioShort} (GAP ₹${gap}, CNT ${cnt})`,
        exchange,
        underlying: symbol,
        expiry,
        ratioLong,
        ratioShort,
        gap,
        cnt,
        stk,
        referenceMode,
        optionType,
        minStrike,
        maxStrike
      });

      const updatedPreset: SavedPreset = {
        id: saved.id,
        name: saved.name,
        symbol: saved.underlying,
        gap: saved.gap,
        cnt: saved.cnt,
        stk: saved.stk,
        ratioLong: saved.ratioLong,
        ratioShort: saved.ratioShort,
        minStrike: saved.minStrike,
        maxStrike: saved.maxStrike,
        createdAt: saved.createdAt
      };

      setSavedPresets(prev => [updatedPreset, ...prev]);
    } catch (e) {
      // ignore
    }
  };

  const handleLoadPreset = (preset: SavedPreset) => {
    selectStock(preset.symbol);
    setGap(preset.gap);
    setCnt(preset.cnt);
    setStk(preset.stk);
    setRatioLong(preset.ratioLong);
    setRatioShort(preset.ratioShort);
    setMinStrike(preset.minStrike);
    setMaxStrike(preset.maxStrike);
  };

  // Strategy Row Generation for Scanner Mode (computed only when SCANNER is active)
  const generatedStrategyRows: RatioStrategyRow[] = useMemo(() => {
    if (activeTab !== 'SCANNER') {
      return [];
    }

    const rows: RatioStrategyRow[] = [];
    const strikes = allListedStrikes;
    const atmIndex = strikes.indexOf(atmStrike);
    const centerIdx = atmIndex >= 0 ? atmIndex : Math.floor(strikes.length / 2);

    const minIdx = Math.max(0, centerIdx - strikeRange);
    const maxIdx = Math.min(strikes.length - 1, centerIdx + strikeRange);

    for (let i = minIdx; i <= maxIdx; i++) {
      let buyIndex = i;
      let sellIndex = -1;
      let effectiveGapSteps = gapSteps;

      if (gapMode === 'STRIKE_STEPS') {
        if (optionType === 'CE') {
          sellIndex = direction === 'NORMAL' ? buyIndex + gapSteps : buyIndex - gapSteps;
        } else {
          sellIndex = direction === 'NORMAL' ? buyIndex - gapSteps : buyIndex + gapSteps;
        }
      } else {
        const baseStrike = strikes[buyIndex];
        const targetStrike =
          optionType === 'CE'
            ? direction === 'NORMAL'
              ? baseStrike + targetPriceGap
              : baseStrike - targetPriceGap
            : direction === 'NORMAL'
            ? baseStrike - targetPriceGap
            : baseStrike + targetPriceGap;

        let bestIdx = -1;
        let bestDiff = Infinity;
        for (let j = 0; j < strikes.length; j++) {
          const diff = Math.abs(strikes[j] - targetStrike);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = j;
          }
        }
        sellIndex = bestIdx;
        effectiveGapSteps = Math.abs(sellIndex - buyIndex);
      }

      if (sellIndex < 0 || sellIndex >= strikes.length || sellIndex === buyIndex) {
        continue;
      }

      const buyStrike = strikes[buyIndex];
      const sellStrike = strikes[sellIndex];
      const actualGap = Math.abs(Math.round((sellStrike - buyStrike) * 100) / 100);

      const buyToken = resolveTokenForExchange(symbol, expiry, buyStrike, optionType, exchange);
      const sellToken = resolveTokenForExchange(symbol, expiry, sellStrike, optionType, exchange);

      const buyContract = contracts.get(buyToken);
      const sellContract = contracts.get(sellToken);

      const buyAsk = buyContract?.ask ?? null;
      const buyBid = buyContract?.bid ?? null;
      const buyAskQty = buyContract?.askQty ?? null;
      const buyBidQty = buyContract?.bidQty ?? null;
      const buyLtp = buyContract?.ltp ?? null;

      const sellBid = sellContract?.bid ?? null;
      const sellAsk = sellContract?.ask ?? null;
      const sellBidQty = sellContract?.bidQty ?? null;
      const sellAskQty = sellContract?.askQty ?? null;
      const sellLtp = sellContract?.ltp ?? null;

      let executableNetEntry: number | null = null;
      let executableTotalEntry: number | null = null;
      let midNetEntry: number | null = null;
      let conservativeLiquidation: number | null = null;
      let slippageCost: number | null = null;

      if (buyAsk !== null && sellBid !== null) {
        executableNetEntry = Math.round((ratioLong * buyAsk - ratioShort * sellBid) * 100) / 100;
        executableTotalEntry = Math.round(executableNetEntry * stock.lotSize * 100) / 100;

        if (buyBid !== null && sellAsk !== null) {
          const buyMid = (buyAsk + buyBid) / 2;
          const sellMid = (sellAsk + sellBid) / 2;
          midNetEntry = Math.round((ratioLong * buyMid - ratioShort * sellMid) * 100) / 100;
          conservativeLiquidation = Math.round((ratioLong * buyBid - ratioShort * sellAsk) * 100) / 100;
          slippageCost = Math.round(Math.abs(executableNetEntry - midNetEntry) * 100) / 100;
        }
      }

      const buySpread = buyAsk !== null && buyBid !== null ? Math.round((buyAsk - buyBid) * 100) / 100 : null;
      const buySpreadPct =
        buySpread !== null && buyAsk !== null && buyAsk > 0
          ? Math.round((buySpread / buyAsk) * 1000) / 10
          : null;

      const sellSpread = sellAsk !== null && sellBid !== null ? Math.round((sellAsk - sellBid) * 100) / 100 : null;
      const sellSpreadPct =
        sellSpread !== null && sellAsk !== null && sellAsk > 0
          ? Math.round((sellSpread / sellAsk) * 1000) / 10
          : null;

      const combinedSpreadCost =
        buySpread !== null && sellSpread !== null
          ? Math.round((ratioLong * buySpread + ratioShort * sellSpread) * 100) / 100
          : null;

      const legs: StrategyLeg[] = [];
      if (buyContract) {
        legs.push({
          side: 'BUY',
          optionType,
          strike: buyStrike,
          quantity: ratioLong,
          actualQuantity: ratioLong * stock.lotSize,
          contract: buyContract,
          executionPrice: buyAsk
        });
      }
      if (sellContract) {
        legs.push({
          side: 'SELL',
          optionType,
          strike: sellStrike,
          quantity: ratioShort,
          actualQuantity: ratioShort * stock.lotSize,
          contract: sellContract,
          executionPrice: sellBid
        });
      }

      const legConfigs = legs.map(l => ({
        side: l.side,
        optionType: l.optionType,
        strike: l.strike,
        quantity: l.quantity,
        price: l.executionPrice || 0
      }));

      const payoffResult = evaluateStrategyPayoff(
        legConfigs,
        executableNetEntry || 0,
        currentSpot,
        stock.lotSize
      );

      const buyDelta = buyContract?.delta || 0;
      const sellDelta = sellContract?.delta || 0;
      const buyTheta = buyContract?.theta || 0;
      const sellTheta = sellContract?.theta || 0;
      const buyGamma = buyContract?.gamma || 0;
      const sellGamma = sellContract?.gamma || 0;
      const buyVega = buyContract?.vega || 0;
      const sellVega = sellContract?.vega || 0;

      const netDelta = Math.round((ratioLong * buyDelta - ratioShort * sellDelta) * 1000) / 1000;
      const netGamma = Math.round((ratioLong * buyGamma - ratioShort * sellGamma) * 10000) / 10000;
      const netTheta = Math.round((ratioLong * buyTheta - ratioShort * sellTheta) * 100) / 100;
      const netVega = Math.round((ratioLong * buyVega - ratioShort * sellVega) * 100) / 100;

      const buyOi = buyContract?.oi || null;
      const sellOi = sellContract?.oi || null;
      const buyOiChg = oiTracker.getOiChange(buyToken, buyOi).change;
      const sellOiChg = oiTracker.getOiChange(sellToken, sellOi).change;
      const buyVol = buyContract?.volume || null;
      const sellVol = sellContract?.volume || null;

      const rowId = `${symbol}|${expiry}|${optionType}|${buyStrike}|${sellStrike}|${ratioLong}|${ratioShort}`;

      rows.push({
        id: rowId,
        underlying: symbol,
        expiry,
        optionType,
        direction,
        ratioStr: `${ratioLong}:${ratioShort}`,
        longQty: ratioLong,
        shortQty: ratioShort,
        buyStrike,
        sellStrike,
        actualGap,
        gapSteps: effectiveGapSteps,
        lotSize: stock.lotSize,
        buyAsk,
        buyBid,
        buyAskQty,
        buyBidQty,
        buyLtp,
        sellBid,
        sellAsk,
        sellBidQty,
        sellAskQty,
        sellLtp,
        executableNetEntry,
        executableTotalEntry,
        midNetEntry,
        conservativeLiquidation,
        slippageCost,
        combinedSpreadCost,
        buySpread,
        buySpreadPct,
        sellSpread,
        sellSpreadPct,
        maxProfitPerShare: payoffResult.maxProfitPerShare,
        maxProfitPerLot: payoffResult.maxProfitPerLot,
        maxProfitAtSpot: payoffResult.maxProfitAtSpot,
        maxLossPerShare: payoffResult.maxLossPerShare,
        maxLossPerLot: payoffResult.maxLossPerLot,
        isUnlimitedLoss: payoffResult.isUnlimitedLoss,
        breakevens: payoffResult.breakevens,
        breakevenDistPcts: payoffResult.breakevenDistPcts,
        currentMtmPerShare: 0,
        currentMtmPerLot: 0,
        buyIv: buyContract?.iv || null,
        sellIv: sellContract?.iv || null,
        netDelta,
        netGamma,
        netTheta,
        netVega,
        lotDelta: Math.round(netDelta * stock.lotSize * 100) / 100,
        lotTheta: Math.round(netTheta * stock.lotSize * 100) / 100,
        buyOi,
        sellOi,
        buyOiChange: buyOiChg,
        sellOiChange: sellOiChg,
        buyVolume: buyVol,
        sellVolume: sellVol,
        combinedOi: (buyOi || 0) + (sellOi || 0),
        combinedVolume: (buyVol || 0) + (sellVol || 0),
        legs
      });
    }

    return rows;
  }, [
    activeTab,
    symbol,
    expiry,
    optionType,
    direction,
    ratioLong,
    ratioShort,
    gapMode,
    gapSteps,
    targetPriceGap,
    strikeRange,
    allListedStrikes,
    atmStrike,
    contracts,
    currentSpot,
    stock.lotSize,
    exchange
  ]);

  const filteredRows = useMemo(() => {
    return generatedStrategyRows.filter(row => {
      if (filter.netType === 'CREDIT_ONLY' && (row.executableNetEntry === null || row.executableNetEntry >= 0)) return false;
      if (filter.netType === 'DEBIT_ONLY' && (row.executableNetEntry === null || row.executableNetEntry <= 0)) return false;
      if (filter.minOi > 0 && (row.combinedOi ?? 0) < filter.minOi) return false;
      if (filter.minVolume > 0 && (row.combinedVolume ?? 0) < filter.minVolume) return false;
      if (filter.maxSpreadPct < 50 && row.buySpreadPct !== null && row.buySpreadPct > filter.maxSpreadPct) return false;
      if (filter.minMaxProfit > 0 && (row.maxProfitPerLot ?? 0) < filter.minMaxProfit) return false;
      if (row.netDelta !== null) {
        if (row.netDelta < filter.minDelta || row.netDelta > filter.maxDelta) return false;
      }
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const text = `${row.buyStrike} ${row.sellStrike} ${row.ratioStr} ${row.actualGap}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [generatedStrategyRows, filter]);

  const sortedRows = useMemo(() => {
    const rowsCopy = [...filteredRows];
    rowsCopy.sort((a, b) => {
      let valA: number | null = 0;
      let valB: number | null = 0;

      switch (sortField) {
        case 'buyStrike': valA = a.buyStrike; valB = b.buyStrike; break;
        case 'netEntry': valA = a.executableNetEntry; valB = b.executableNetEntry; break;
        case 'maxProfit': valA = a.maxProfitPerLot; valB = b.maxProfitPerLot; break;
        case 'netDelta': valA = a.netDelta; valB = b.netDelta; break;
        case 'netTheta': valA = a.netTheta; valB = b.netTheta; break;
        case 'combinedOi': valA = a.combinedOi; valB = b.combinedOi; break;
        case 'combinedVolume': valA = a.combinedVolume; valB = b.combinedVolume; break;
      }

      if (valA === null) return 1;
      if (valB === null) return -1;
      return sortDirection === 'ASC' ? valA - valB : valB - valA;
    });
    return rowsCopy;
  }, [filteredRows, sortField, sortDirection]);

  // Load saved presets on mount for user session
  useEffect(() => {
    if (currentUser) {
      authService.getSavedStrategies().then(strats => {
        const formatted: SavedPreset[] = strats.map(s => ({
          id: s.id,
          name: s.name,
          symbol: s.underlying,
          gap: s.gap,
          cnt: s.cnt,
          stk: s.stk,
          ratioLong: s.ratioLong,
          ratioShort: s.ratioShort,
          minStrike: s.minStrike,
          maxStrike: s.maxStrike,
          createdAt: s.createdAt
        }));
        setSavedPresets(formatted);
      });
    }
  }, [currentUser]);

  return (
    <>
      <TerminalLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        exchange={exchange}
        onSelectExchange={selectExchange}
        selectedStock={stock}
        onSelectStock={selectStock}
        selectedExpiry={expiry}
        onSelectExpiry={setExpiry}
        metrics={metrics}
        summary={stockSummary}
        onRefreshLive={() => marketDataFeed.forceRefreshLiveQuotes()}
        onOpenAngelModal={() => setIsAngelModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        currentUser={currentUser || undefined}
        onOpenSettings={() => {
          setShowSettingsOverlay(true);
          setShowAdminOverlay(false);
        }}
        onOpenAdmin={() => {
          setShowAdminOverlay(true);
          setShowSettingsOverlay(false);
        }}
        onLogout={logout}
        snapshotStrip={
          <MarketSnapshotStrip
            symbol={symbol}
            exchange={exchange}
            summary={stockSummary}
            metrics={metrics}
            onRefreshLive={() => marketDataFeed.forceRefreshLiveQuotes()}
          />
        }
        statusBar={
          <StatusBar
            metrics={metrics}
            stock={stock}
            currentSpot={currentSpot}
            summary={stockSummary}
            expiry={expiry}
            stk={stk}
            exchange={exchange}
          />
        }
        stockSwitchToast={
          stockSwitchToast ? (
            <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-mono rounded-lg shadow-2xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{stockSwitchToast}</span>
            </div>
          ) : undefined
        }
      >
        {/* VIEW 1: RATIO MATRIX SPREADSHEET */}
        {activeTab === 'MATRIX' && (
          <div className="flex flex-col gap-3 sm:gap-3.5 flex-1">
            <StrategyControlBar
              stock={stock}
              optionType={optionType}
              onChangeOptionType={setOptionType}
              direction={direction}
              onChangeDirection={setDirection}
              ratioLong={ratioLong}
              ratioShort={ratioShort}
              onChangeRatio={(l, s) => {
                setRatioLong(l);
                setRatioShort(s);
              }}
              gap={gap}
              onChangeGap={setGap}
              cnt={cnt}
              onChangeCnt={setCnt}
              stk={stk}
              onChangeStk={setStk}
              minStrike={minStrike}
              onChangeMinStrike={setMinStrike}
              maxStrike={maxStrike}
              onChangeMaxStrike={setMaxStrike}
              allStrikes={allListedStrikes}
              referenceMode={referenceMode}
              onChangeReferenceMode={setReferenceMode}
              atmStrike={atmStrike}
              density={density}
              onChangeDensity={setDensity}
              maxVisibleRows={maxVisibleRows}
              onChangeMaxVisibleRows={setMaxVisibleRows}
              showAdvancedData={showAdvancedData}
              onToggleAdvancedData={() => setShowAdvancedData(!showAdvancedData)}
              onReset={resetStockConfig}
              onSavePreset={handleSavePreset}
              savedPresets={savedPresets}
              onLoadPreset={handleLoadPreset}
            />

            <ProCard
              bordered
              size="default"
              className="shadow-2xs rounded-2xl overflow-hidden dark:bg-slate-900/80"
              bodyStyle={{ padding: 0 }}
            >
              <RatioMatrixSpreadsheet
                stock={stock}
                expiry={expiry}
                optionType={optionType}
                onChangeOptionType={setOptionType}
                ratioLong={ratioLong}
                ratioShort={ratioShort}
                gap={gap}
                onChangeGap={setGap}
                cnt={cnt}
                onChangeCnt={setCnt}
                stk={stk}
                onChangeStk={setStk}
                minStrike={minStrike}
                onChangeMinStrike={setMinStrike}
                maxStrike={maxStrike}
                onChangeMaxStrike={setMaxStrike}
                allStrikes={allListedStrikes}
                currentSpot={currentSpot}
                contracts={contracts}
                onSelectStrategy={setSelectedStrategyRow}
                selectedStrategyId={selectedStrategyRow?.id}
                onReset={resetStockConfig}
                onSavePreset={handleSavePreset}
                savedPresets={savedPresets}
                onLoadPreset={handleLoadPreset}
                exchange={exchange}
                density={density}
                showAdvancedData={showAdvancedData}
                maxVisibleRows={maxVisibleRows}
              />
            </ProCard>

            {selectedStrategyRow && (
              <React.Suspense fallback={null}>
                <SelectedStrategyPanel
                  strategy={selectedStrategyRow}
                  onClose={() => setSelectedStrategyRow(null)}
                  currentSpot={currentSpot}
                />
              </React.Suspense>
            )}
          </div>
        )}

        {/* VIEW 2: SPREAD SCANNER */}
        {activeTab === 'SCANNER' && (
          <React.Suspense fallback={<LoadingScreen mode="panel" tip="Calibrating Ratio Spread Scanner Grid..." />}>
            <div className="flex flex-col gap-3 sm:gap-3.5">
              <ControlsPanel
                selectedStock={stock}
                onSelectStock={selectStock}
                selectedExpiry={expiry}
                onSelectExpiry={setExpiry}
                optionType={optionType}
                onChangeOptionType={setOptionType}
                direction={direction}
                onChangeDirection={setDirection}
                ratioLong={ratioLong}
                ratioShort={ratioShort}
                onChangeRatio={(l, s) => {
                  setRatioLong(l);
                  setRatioShort(s);
                }}
                gapMode={gapMode}
                onChangeGapMode={setGapMode}
                gapSteps={gapSteps}
                onChangeGapSteps={setGapSteps}
                targetPriceGap={targetPriceGap}
                onChangeTargetPriceGap={setTargetPriceGap}
                strikeRange={strikeRange}
                onChangeStrikeRange={setStrikeRange}
                referenceMode={referenceMode}
                onChangeReferenceMode={setReferenceMode}
                atmStrike={atmStrike}
                pricingMode={pricingMode}
                onChangePricingMode={setPricingMode}
                availableStrikesCount={availableStrikesCount}
              />

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <FilterToolbar
                  filter={filter}
                  onChangeFilter={setFilter}
                  sortField={sortField}
                  onChangeSortField={setSortField}
                  sortDirection={sortDirection}
                  onToggleSortDirection={() => setSortDirection(d => (d === 'ASC' ? 'DESC' : 'ASC'))}
                  totalCount={generatedStrategyRows.length}
                  filteredCount={sortedRows.length}
                />

                <RatioSpreadGrid
                  rows={sortedRows}
                  onSelectRow={setSelectedStrategyRow}
                  selectedRowId={selectedStrategyRow?.id}
                  currentSpot={currentSpot}
                  lotSize={stock.lotSize}
                />
              </div>
            </div>
          </React.Suspense>
        )}

        {/* VIEW 3: OPTION CHAIN DUAL VIEW */}
        {activeTab === 'OPTION_CHAIN' && (
          <ProCard
            bordered
            size="default"
            className="shadow-2xs rounded-2xl overflow-hidden dark:bg-slate-900/80"
            bodyStyle={{ padding: 0 }}
          >
            <React.Suspense fallback={<LoadingScreen mode="panel" tip="Loading Option Chain Dual Depth..." />}>
              <OptionChainDualView
                contracts={contracts}
                strikes={allListedStrikes}
                currentSpot={currentSpot}
                selectedSymbol={symbol}
                selectedExpiry={expiry}
                activeBuyStrike={selectedStrategyRow?.buyStrike}
                activeSellStrike={selectedStrategyRow?.sellStrike}
                onSelectStrike={(_strike) => {
                  // Keep the Option Chain table active and visible
                }}
                exchange={exchange}
              />
            </React.Suspense>
          </ProCard>
        )}

        {/* VIEW 4: ALL RATIOS COMPARATIVE SCANNER */}
        {activeTab === 'ALL_RATIOS' && (
          <ProCard
            bordered
            size="default"
            className="shadow-2xs rounded-2xl overflow-hidden dark:bg-slate-900/80"
            bodyStyle={{ padding: 0 }}
          >
            <AllRatiosScanner
              stock={stock}
              expiry={expiry}
              optionType={optionType}
              contracts={contracts}
              allStrikes={allListedStrikes}
              currentSpot={currentSpot}
              onSelectStrategy={setSelectedStrategyRow}
              exchange={exchange}
            />
          </ProCard>
        )}
      </TerminalLayout>

      {/* Modals & Overlays wrapped in Suspense for zero initial bundle overhead */}
      <React.Suspense fallback={null}>
        {showSettingsOverlay && currentUser && (
          <SettingsPage
            isOpen={showSettingsOverlay}
            user={currentUser}
            onLogout={logout}
            onClose={() => setShowSettingsOverlay(false)}
          />
        )}

        {showAdminOverlay && currentUser && (
          <AdminPage
            isOpen={showAdminOverlay}
            currentUser={currentUser}
            onClose={() => setShowAdminOverlay(false)}
          />
        )}

        {isAngelModalOpen && (
          <AngelOneModal
            isOpen={isAngelModalOpen}
            onClose={() => setIsAngelModalOpen(false)}
            metrics={metrics}
          />
        )}

        {isTestModalOpen && (
          <UnitTestsModal
            isOpen={isTestModalOpen}
            onClose={() => setIsTestModalOpen(false)}
          />
        )}
      </React.Suspense>
    </>
  );
};

export const MainTerminalPage: React.FC = () => {
  return (
    <TerminalProvider>
      <MarketDataProvider>
        <MainTerminalContent />
      </MarketDataProvider>
    </TerminalProvider>
  );
};

export default MainTerminalPage;
