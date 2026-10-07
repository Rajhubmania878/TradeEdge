import React from 'react';
import { RatioStrategyRow, OptionContract } from '@/shared/types';
import { usePriceFlash } from '@/shared/hooks';

interface MatrixCellData {
  targetGap: number;
  actualGap: number;
  gapSteps: number;
  isValid: boolean;
  buyStrike: number;
  sellStrike: number;
  buyAsk: number | null;
  buyBid: number | null;
  sellBid: number | null;
  sellAsk: number | null;
  netEntryBuy: number | null;
  netEntrySell: number | null;
  buyContract?: OptionContract;
  sellContract?: OptionContract;
  strategyRow?: RatioStrategyRow;
}

interface MatrixCellRendererProps {
  cell: MatrixCellData;
  idx: number;
  selectedStrategyId?: string;
  onSelectStrategy: (strategy: RatioStrategyRow) => void;
  showAdvancedData: boolean;
  cellPy: string;
  cellPx: string;
}

export const MatrixCellRenderer: React.FC<MatrixCellRendererProps> = React.memo(({
  cell,
  idx,
  selectedStrategyId,
  onSelectStrategy,
  showAdvancedData,
  cellPy,
  cellPx
}) => {
  const {
    buyAsk,
    sellBid,
    netEntryBuy,
    strategyRow,
    buyContract
  } = cell;

  const isEvenGroup = idx % 2 === 0;
  const groupBgClass = isEvenGroup
    ? 'bg-white dark:bg-slate-950'
    : 'bg-slate-50/70 dark:bg-slate-900/40';

  const isSelected = selectedStrategyId && strategyRow?.id === selectedStrategyId;

  const buyCellFlash = usePriceFlash(netEntryBuy);
  const sellCellFlash = usePriceFlash(sellBid);

  return (
    <React.Fragment>
      {/* BUY CELL (Executable Net Entry) */}
      <td
        onClick={() => strategyRow && onSelectStrategy(strategyRow)}
        className={`${cellPy} ${cellPx} text-right cursor-pointer transition-colors border-r border-slate-200/80 dark:border-slate-800/80 whitespace-nowrap ${groupBgClass} ${buyCellFlash} ${
          isSelected
            ? 'bg-blue-500/15 ring-2 ring-inset ring-blue-500 text-slate-900 dark:text-white font-bold'
            : 'hover:bg-emerald-500/10'
        }`}
      >
        {netEntryBuy !== null ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span
                className={`text-xs tabular-nums font-mono font-bold ${
                  netEntryBuy < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {netEntryBuy < 0 ? `-₹${Math.abs(netEntryBuy).toFixed(2)}` : `+₹${netEntryBuy.toFixed(2)}`}
              </span>
              <span
                className={`text-[9px] font-sans font-bold px-1 py-0 rounded ${
                  netEntryBuy < 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {netEntryBuy < 0 ? 'CR' : 'DB'}
              </span>
            </div>
            <span className="text-[11px] font-mono mt-0.5 text-slate-400 dark:text-slate-500 tabular-nums">
              Ask: {buyAsk !== null ? `₹${buyAsk.toFixed(2)}` : '-'}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">-</span>
        )}
      </td>

      {/* SELL CELL WITH DISTINCT 2px GAP GROUP BOUNDARY */}
      <td
        onClick={() => strategyRow && onSelectStrategy(strategyRow)}
        className={`${cellPy} ${cellPx} text-right cursor-pointer transition-colors whitespace-nowrap ${groupBgClass} ${sellCellFlash} ${
          showAdvancedData
            ? 'border-r border-slate-200 dark:border-slate-800'
            : 'border-r-2 border-slate-300 dark:border-slate-700'
        } ${
          isSelected
            ? 'bg-rose-500/15 ring-2 ring-inset ring-rose-500 text-slate-900 dark:text-white font-bold'
            : 'hover:bg-rose-500/10'
        }`}
      >
        {sellBid !== null ? (
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-700 dark:text-slate-300 tabular-nums font-mono font-semibold">
              ₹{sellBid.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono mt-0.5 text-slate-400 dark:text-slate-500 tabular-nums">
              Sell: ₹{cell.sellStrike}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">-</span>
        )}
      </td>

      {/* ADVANCED DATA COLUMNS (Optional) */}
      {showAdvancedData && (
        <>
          {/* IV */}
          <td className={`${cellPy} ${cellPx} text-right border-r border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap ${groupBgClass}`}>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {buyContract?.iv ? `${buyContract.iv.toFixed(1)}%` : '-'}
            </span>
          </td>

          {/* DELTA */}
          <td className={`${cellPy} ${cellPx} text-right border-r border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap ${groupBgClass}`}>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {buyContract?.delta ? buyContract.delta.toFixed(2) : '-'}
            </span>
          </td>

          {/* OI */}
          <td className={`${cellPy} ${cellPx} text-right border-r border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap ${groupBgClass}`}>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {buyContract?.oi ? `${(buyContract.oi / 1000).toFixed(1)}k` : '-'}
            </span>
          </td>

          {/* VOLUME (WITH 2px GROUP BOUNDARY) */}
          <td className={`${cellPy} ${cellPx} text-right border-r-2 border-slate-300 dark:border-slate-700 whitespace-nowrap ${groupBgClass}`}>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {buyContract?.volume ? `${(buyContract.volume / 1000).toFixed(1)}k` : '-'}
            </span>
          </td>
        </>
      )}
    </React.Fragment>
  );
});
