import React from 'react';
import { RatioStrategyRow, OptionContract } from '@/shared/types';
import { MatrixCellRenderer } from './MatrixCellRenderer';

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

interface MatrixRowData {
  strike: number;
  ltp: number | null;
  isAtm: boolean;
  isItm: boolean;
  cells: MatrixCellData[];
}

interface MatrixStrikeRowProps {
  row: MatrixRowData;
  selectedStrategyId?: string;
  onSelectStrategy: (strategy: RatioStrategyRow) => void;
  showAdvancedData: boolean;
  cellPy: string;
  cellPx: string;
}

export const MatrixStrikeRow: React.FC<MatrixStrikeRowProps> = React.memo(({
  row,
  selectedStrategyId,
  onSelectStrategy,
  showAdvancedData,
  cellPy,
  cellPx
}) => {
  const { strike, ltp, isAtm, isItm, cells } = row;

  // Row background style
  let rowBgClass = isItm
    ? 'bg-slate-100/50 dark:bg-slate-900/40'
    : 'bg-white dark:bg-slate-950';

  if (isAtm) {
    rowBgClass = 'bg-amber-500/10 dark:bg-amber-500/15 border-y-2 border-amber-500/60 font-semibold';
  }

  return (
    <tr className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group ${rowBgClass}`}>
      {/* STICKY STRIKE COLUMN */}
      <td className={`sticky left-0 z-10 ${cellPy} px-3.5 text-center font-bold border-r border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap min-w-[104px] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_4px_-1px_rgba(0,0,0,0.4)] ${
        isAtm
          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
          : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 group-hover:bg-blue-100/50 dark:group-hover:bg-slate-800'
      }`}>
        <div className="flex items-center justify-center gap-1.5 font-mono">
          <span>{strike.toLocaleString('en-IN')}</span>
          {isAtm && (
            <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold shadow-2xs">
              ATM
            </span>
          )}
        </div>
      </td>

      {/* STICKY LTP COLUMN WITH PROMINENT FREEZE BOUNDARY DIVIDER */}
      <td className={`sticky left-[104px] z-10 ${cellPy} px-3.5 text-right font-mono text-xs tabular-nums border-r-2 border-slate-300 dark:border-slate-700 transition-colors whitespace-nowrap min-w-[92px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.6)] ${
        isAtm
          ? 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-950 dark:text-amber-200 font-bold'
          : 'bg-white/95 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 group-hover:bg-blue-100/30 dark:group-hover:bg-slate-800'
      }`}>
        {ltp !== null ? `₹${ltp.toFixed(2)}` : '-'}
      </td>

      {/* GAP CELLS */}
      {cells.map((cell, idx) => (
        <MatrixCellRenderer
          key={cell.targetGap}
          cell={cell}
          idx={idx}
          selectedStrategyId={selectedStrategyId}
          onSelectStrategy={onSelectStrategy}
          showAdvancedData={showAdvancedData}
          cellPy={cellPy}
          cellPx={cellPx}
        />
      ))}
    </tr>
  );
});
