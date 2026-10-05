import React, { useMemo } from 'react';
import {
  OptionType,
  RatioStrategyRow,
  OptionContract,
  UnderlyingStock,
  SavedPreset,
  Exchange
} from '@/shared/types';
import { resolveTokenForExchange } from '@/data/universeManager';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { Empty, Space, Tag, Typography } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { GapStepHeader } from './GapStepHeader';
import { MatrixStrikeRow } from './MatrixStrikeRow';

interface RatioMatrixSpreadsheetProps {
  stock: UnderlyingStock;
  expiry: string;
  optionType: OptionType;
  onChangeOptionType: (type: OptionType) => void;
  ratioLong: number;
  ratioShort: number;
  gap: number;
  onChangeGap: (gap: number) => void;
  cnt: number;
  onChangeCnt: (cnt: number) => void;
  stk: string | number;
  onChangeStk: (stk: string | number) => void;
  minStrike: number | 'ALL';
  onChangeMinStrike: (min: number | 'ALL') => void;
  maxStrike: number | 'ALL';
  onChangeMaxStrike: (max: number | 'ALL') => void;
  allStrikes: number[];
  currentSpot: number;
  contracts: Map<string, OptionContract>;
  onSelectStrategy: (strategy: RatioStrategyRow) => void;
  selectedStrategyId?: string;
  onReset: () => void;
  onSavePreset: () => void;
  savedPresets: SavedPreset[];
  onLoadPreset: (preset: SavedPreset) => void;
  exchange?: Exchange;
  density?: 'compact' | 'comfortable';
  showAdvancedData?: boolean;
}

export const RatioMatrixSpreadsheet: React.FC<RatioMatrixSpreadsheetProps> = ({
  stock,
  expiry,
  optionType,
  ratioLong,
  ratioShort,
  gap,
  cnt,
  stk,
  minStrike,
  maxStrike,
  allStrikes,
  currentSpot,
  contracts,
  onSelectStrategy,
  selectedStrategyId,
  exchange = 'NSE',
  density = 'comfortable',
  showAdvancedData = false
}) => {
  // Determine actual exchange step
  const actualExchangeStep = stock.strikeStep;
  const effectiveStkStep = stk === 'AUTO' ? actualExchangeStep : Number(stk);

  // Generate target gaps: gap, gap*2, gap*3, ..., gap*cnt
  const targetGaps = useMemo(() => {
    const list: number[] = [];
    const count = Math.min(25, Math.max(1, cnt));
    for (let i = 1; i <= count; i++) {
      list.push(gap * i);
    }
    return list;
  }, [gap, cnt]);

  // Validate gaps against actual exchange strike step
  const gapValidationInfo = useMemo(() => {
    let allValid = true;
    const validated = targetGaps.map(g => {
      const remainder = g % effectiveStkStep;
      const isExact = Math.abs(remainder) < 0.01 || Math.abs(remainder - effectiveStkStep) < 0.01;
      if (!isExact) allValid = false;

      const nearestMultiplier = Math.max(1, Math.round(g / effectiveStkStep));
      const nearestValidGap = nearestMultiplier * effectiveStkStep;

      return {
        target: g,
        actual: nearestValidGap,
        isValid: isExact,
        steps: nearestMultiplier
      };
    });

    return { allValid, validated };
  }, [targetGaps, effectiveStkStep]);

  // Filter visible strikes based on MIN and MAX
  const visibleStrikes = useMemo(() => {
    const filtered = allStrikes.filter(s => {
      if (minStrike !== 'ALL' && s < minStrike) return false;
      if (maxStrike !== 'ALL' && s > maxStrike) return false;
      return true;
    });
    // If filter filtered everything out (e.g. inverted min/max), fallback to all listed strikes
    if (filtered.length === 0 && allStrikes.length > 0) {
      return allStrikes;
    }
    return filtered;
  }, [allStrikes, minStrike, maxStrike]);

  // ATM Strike
  const atmStrike = useMemo(() => {
    if (allStrikes.length === 0) return currentSpot;
    let closest = allStrikes[0];
    let minDiff = Math.abs(currentSpot - closest);
    for (const s of allStrikes) {
      const diff = Math.abs(currentSpot - s);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    return closest;
  }, [allStrikes, currentSpot]);

  // Fast O(1) Set for strike lookups inside matrix loops
  const strikesSet = useMemo(() => new Set(allStrikes), [allStrikes]);

  // Build matrix rows for each visible strike and gap level
  const matrixRows = useMemo(() => {
    return visibleStrikes.map(rowStrike => {
      const buyStrike = rowStrike;
      const buyToken = resolveTokenForExchange(stock.symbol, expiry, buyStrike, optionType, exchange);
      const buyContract = contracts.get(buyToken);
      const buyLtp = buyContract?.ltp ?? null;
      const buyAsk = buyContract?.ask ?? null;
      const buyBid = buyContract?.bid ?? null;

      const cells = gapValidationInfo.validated.map(gInfo => {
        // For CE: Buy lower strike, Sell higher strike (buyStrike + gap)
        // For PE: Buy higher strike, Sell lower strike (buyStrike - gap)
        const sellStrike =
          optionType === 'CE'
            ? Math.round((buyStrike + gInfo.actual) * 100) / 100
            : Math.round((buyStrike - gInfo.actual) * 100) / 100;

        const strikeExists = strikesSet.has(sellStrike);
        if (!strikeExists || sellStrike <= 0) {
          return {
            targetGap: gInfo.target,
            actualGap: gInfo.actual,
            gapSteps: gInfo.steps,
            isValid: false,
            buyStrike,
            sellStrike,
            buyAsk: null,
            buyBid: null,
            sellBid: null,
            sellAsk: null,
            netEntryBuy: null,
            netEntrySell: null,
            strategyRow: undefined
          };
        }

        const sellToken = resolveTokenForExchange(stock.symbol, expiry, sellStrike, optionType, exchange);
        const sellContract = contracts.get(sellToken);

        const effectiveBuyAsk = buyAsk ?? (buyContract?.ltp ? Math.round((buyContract.ltp + 0.1) * 20) / 20 : null);
        const effectiveBuyBid = buyBid ?? (buyContract?.ltp ? Math.max(0.05, Math.round((buyContract.ltp - 0.1) * 20) / 20) : null);
        const effectiveSellBid =
          (sellContract?.bid !== null && sellContract?.bid !== undefined && sellContract.bid > 0)
            ? sellContract.bid
            : (sellContract?.ltp ? Math.max(0.05, Math.round((sellContract.ltp - 0.1) * 20) / 20) : null);
        const effectiveSellAsk =
          (sellContract?.ask !== null && sellContract?.ask !== undefined && sellContract.ask > 0)
            ? sellContract.ask
            : (sellContract?.ltp ? Math.round((sellContract.ltp + 0.1) * 20) / 20 : null);

        let netEntryBuy: number | null = null;
        let netEntrySell: number | null = null;
        let strategyRow: RatioStrategyRow | undefined;

        if (effectiveBuyAsk !== null && effectiveSellBid !== null) {
          netEntryBuy = Math.round((ratioLong * effectiveBuyAsk - ratioShort * effectiveSellBid) * 100) / 100;
        }

        if (effectiveBuyBid !== null && effectiveSellAsk !== null) {
          netEntrySell = Math.round((ratioLong * effectiveBuyBid - ratioShort * effectiveSellAsk) * 100) / 100;
        }

        if (buyContract && sellContract && netEntryBuy !== null) {
          const legs = [
            {
              side: 'BUY' as const,
              optionType,
              strike: buyStrike,
              quantity: ratioLong,
              actualQuantity: ratioLong * stock.lotSize,
              contract: buyContract,
              executionPrice: effectiveBuyAsk
            },
            {
              side: 'SELL' as const,
              optionType,
              strike: sellStrike,
              quantity: ratioShort,
              actualQuantity: ratioShort * stock.lotSize,
              contract: sellContract,
              executionPrice: effectiveSellBid
            }
          ];

          const id = `${stock.symbol}|${expiry}|${optionType}|${buyStrike}|${sellStrike}|${ratioLong}|${ratioShort}`;
          const isCurrentSelected = selectedStrategyId === id;

          // Only calculate heavy 120-step breakeven root-finding & 80 curve coordinates for the currently selected row
          let payoffResult: {
            maxProfitPerShare: number;
            maxProfitPerLot: number;
            maxProfitAtSpot: number | null;
            maxLossPerShare: number | 'Unlimited';
            maxLossPerLot: number | 'Unlimited';
            isUnlimitedLoss: boolean;
            breakevens: number[];
            breakevenDistPcts: number[];
          } = {
            maxProfitPerShare: 0,
            maxProfitPerLot: 0,
            maxProfitAtSpot: 0,
            maxLossPerShare: 0,
            maxLossPerLot: 0,
            isUnlimitedLoss: false,
            breakevens: [],
            breakevenDistPcts: []
          };

          if (isCurrentSelected) {
            const legConfigs = legs.map(l => ({
              side: l.side,
              optionType: l.optionType,
              strike: l.strike,
              quantity: l.quantity,
              price: l.executionPrice || 0
            }));
            const evaluated = evaluateStrategyPayoff(
              legConfigs,
              netEntryBuy,
              currentSpot,
              stock.lotSize
            );
            payoffResult = {
              maxProfitPerShare: evaluated.maxProfitPerShare,
              maxProfitPerLot: evaluated.maxProfitPerLot,
              maxProfitAtSpot: evaluated.maxProfitAtSpot,
              maxLossPerShare: evaluated.maxLossPerShare,
              maxLossPerLot: evaluated.maxLossPerLot,
              isUnlimitedLoss: evaluated.isUnlimitedLoss,
              breakevens: evaluated.breakevens,
              breakevenDistPcts: evaluated.breakevenDistPcts
            };
          }

          strategyRow = {
            id,
            underlying: stock.symbol,
            expiry,
            optionType,
            direction: 'NORMAL',
            ratioStr: `${ratioLong}:${ratioShort}`,
            longQty: ratioLong,
            shortQty: ratioShort,
            buyStrike,
            sellStrike,
            actualGap: gInfo.actual,
            gapSteps: gInfo.steps,
            lotSize: stock.lotSize,
            buyAsk: effectiveBuyAsk,
            buyBid: effectiveBuyBid,
            buyAskQty: buyContract.askQty,
            buyBidQty: buyContract.bidQty,
            buyLtp: buyContract.ltp,
            sellBid: effectiveSellBid,
            sellAsk: effectiveSellAsk,
            sellBidQty: sellContract.bidQty,
            sellAskQty: sellContract.askQty,
            sellLtp: sellContract.ltp,
            executableNetEntry: netEntryBuy,
            executableTotalEntry: Math.round(netEntryBuy * stock.lotSize * 100) / 100,
            midNetEntry: null,
            conservativeLiquidation: null,
            slippageCost: null,
            combinedSpreadCost: null,
            buySpread: null,
            buySpreadPct: null,
            sellSpread: null,
            sellSpreadPct: null,
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
            buyIv: buyContract.iv,
            sellIv: sellContract.iv,
            netDelta: null,
            netGamma: null,
            netTheta: null,
            netVega: null,
            lotDelta: null,
            lotTheta: null,
            buyOi: buyContract.oi,
            sellOi: sellContract.oi,
            buyOiChange: 0,
            sellOiChange: 0,
            buyVolume: buyContract.volume,
            sellVolume: sellContract.volume,
            combinedOi: (buyContract.oi || 0) + (sellContract.oi || 0),
            combinedVolume: (buyContract.volume || 0) + (sellContract.volume || 0),
            legs
          };
        }

        return {
          targetGap: gInfo.target,
          actualGap: gInfo.actual,
          gapSteps: gInfo.steps,
          isValid: gInfo.isValid,
          buyStrike,
          sellStrike,
          buyAsk: effectiveBuyAsk,
          buyBid: effectiveBuyBid,
          sellBid: effectiveSellBid,
          sellAsk: effectiveSellAsk,
          netEntryBuy,
          netEntrySell,
          buyContract,
          sellContract,
          strategyRow
        };
      });

      // ITM / OTM determination
      const isAtm = buyStrike === atmStrike;
      const isItm = optionType === 'CE' ? buyStrike < currentSpot : buyStrike > currentSpot;

      return {
        strike: buyStrike,
        ltp: buyLtp,
        isAtm,
        isItm,
        cells
      };
    });
  }, [
    visibleStrikes,
    stock,
    expiry,
    optionType,
    exchange,
    contracts,
    gapValidationInfo,
    allStrikes,
    ratioLong,
    ratioShort,
    currentSpot,
    atmStrike
  ]);

  // Style helper based on density
  const cellPy = density === 'compact' ? 'py-2.5' : 'py-3.5';
  const cellPx = density === 'compact' ? 'px-3' : 'px-4';

  const handleSelectStrategy = React.useCallback((row: RatioStrategyRow) => {
    if (row.breakevens.length === 0 && row.legs && row.legs.length > 0) {
      const legConfigs = row.legs.map(l => ({
        side: l.side,
        optionType: l.optionType,
        strike: l.strike,
        quantity: l.quantity,
        price: l.executionPrice || 0
      }));
      const evaluated = evaluateStrategyPayoff(
        legConfigs,
        row.executableNetEntry || 0,
        currentSpot,
        stock.lotSize
      );
      onSelectStrategy({
        ...row,
        maxProfitPerShare: evaluated.maxProfitPerShare,
        maxProfitPerLot: evaluated.maxProfitPerLot,
        maxProfitAtSpot: evaluated.maxProfitAtSpot,
        maxLossPerShare: evaluated.maxLossPerShare,
        maxLossPerLot: evaluated.maxLossPerLot,
        isUnlimitedLoss: evaluated.isUnlimitedLoss,
        breakevens: evaluated.breakevens,
        breakevenDistPcts: evaluated.breakevenDistPcts
      });
    } else {
      onSelectStrategy(row);
    }
  }, [currentSpot, stock.lotSize, onSelectStrategy]);

  if (visibleStrikes.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <Empty
          description={
            <span className="font-sans text-xs text-slate-500">
              No strikes found in the selected strike range. Adjust MIN or MAX filter.
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* PROFESSIONAL ANT DESIGN CARD HEADER */}
      <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
        <Space size={10} align="center" wrap>
          {optionType === 'CE' ? (
            <Tag
              color="success"
              className="font-sans font-bold text-xs uppercase min-w-[104px] justify-center px-3 py-1 m-0 rounded-md flex items-center gap-1.5 shadow-2xs"
            >
              <RiseOutlined /> CALLS (CE)
            </Tag>
          ) : (
            <Tag
              color="error"
              className="font-sans font-bold text-xs uppercase min-w-[104px] justify-center px-3 py-1 m-0 rounded-md flex items-center gap-1.5 shadow-2xs"
            >
              <FallOutlined /> PUTS (PE)
            </Tag>
          )}

          <Typography.Text strong className="font-sans text-sm tracking-tight text-slate-900 dark:text-white">
            Ratio Spread Matrix
          </Typography.Text>

          <Tag color="blue" className="font-mono text-xs font-semibold px-2 py-0.5 m-0 rounded-md">
            Ratio {ratioLong}:{ratioShort}
          </Tag>

          {effectiveStkStep > 0 && (
            <Tag className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 m-0">
              Step: ₹{effectiveStkStep}
            </Tag>
          )}
        </Space>

        <Space size={12} align="center" className="text-xs">
          <Tag color="cyan" className="font-sans font-bold text-xs px-2 py-0.5 m-0">
            {stock.symbol}
          </Tag>
          <span className="text-slate-500 dark:text-slate-400 font-sans">
            Lot Size: <strong className="text-slate-900 dark:text-slate-100 font-mono">{stock.lotSize}</strong>
          </span>
        </Space>
      </div>

      {/* MATRIX TABLE CONTAINER WITH STICKY HEADERS & COLUMNS */}
      <div className="relative overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] border-b border-slate-200 dark:border-slate-800 slim-scrollbar bg-white dark:bg-slate-950">
        <table className="w-full text-left border-collapse text-xs select-none">
          <GapStepHeader
            validatedGaps={gapValidationInfo.validated}
            effectiveStkStep={effectiveStkStep}
            showAdvancedData={showAdvancedData}
            ratioLong={ratioLong}
            ratioShort={ratioShort}
          />

          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 font-mono">
            {matrixRows.map(row => (
              <MatrixStrikeRow
                key={row.strike}
                row={row}
                selectedStrategyId={selectedStrategyId}
                onSelectStrategy={handleSelectStrategy}
                showAdvancedData={showAdvancedData}
                cellPy={cellPy}
                cellPx={cellPx}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
