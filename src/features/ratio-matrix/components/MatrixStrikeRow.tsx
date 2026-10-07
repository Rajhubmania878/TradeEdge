import React from 'react';
import { RatioStrategyRow, OptionContract } from '@/shared/types';
import { MatrixCellRenderer } from './MatrixCellRenderer';
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

  const ltpFlash = usePriceFlash(ltp);

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
      <td className={`sticky left-[104px] z-10 ${cellPy} px-3.5 text-right font-mono text-xs tabular-nums border-r-2 border-slate-300 dark:border-slate-700 transition-colors whitespace-nowrap min-w-[92px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.6)] ${ltpFlash} ${
        isAtm
          ? 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-950 dark:text-amber-200 font-bold'
          : 'bg-slate-50/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 group-hover:bg-blue-100/50 dark:group-hover:bg-slate-800'
      }`}>
        {ltp !== null ? `₹${ltp.toFixed(2)}` : '-'}
      </td>

      {/* MATRIX GAP STRATEGY CELLS */}
      {cells.map((cell, idx) => (
        <MatrixCellRenderer
          key={`${strike}-${cell.targetGap}`}
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
}, (prev, next) => {
  // Ultra-fast custom memo comparator for selective 60 FPS row updates
  if (prev.showAdvancedData !== next.showAdvancedData) return false;
  if (prev.cellPy !== next.cellPy || prev.cellPx !== next.cellPx) return false;
  if (prev.row.strike !== next.row.strike) return false;
  if (prev.row.ltp !== next.row.ltp) return false;
  if (prev.row.isAtm !== next.row.isAtm || prev.row.isItm !== next.row.isItm) return false;

  // Selection toggle state check for this specific row
  const prevHasSelected = prev.selectedStrategyId && prev.row.cells.some(c => c.strategyRow?.id === prev.selectedStrategyId);
  const nextHasSelected = next.selectedStrategyId && next.row.cells.some(c => c.strategyRow?.id === next.selectedStrategyId);
  if (prevHasSelected !== nextHasSelected) return false;

  // Compare cell quote data
  if (prev.row.cells.length !== next.row.cells.length) return false;
  for (let i = 0; i < prev.row.cells.length; i++) {
    const p = prev.row.cells[i];
    const n = next.row.cells[i];
    if (p.netEntryBuy !== n.netEntryBuy || p.sellBid !== n.sellBid || p.buyAsk !== n.buyAsk) return false;
    if (prev.showAdvancedData) {
      if (
        p.buyContract?.iv !== n.buyContract?.iv ||
        p.buyContract?.oi !== n.buyContract?.oi ||
        p.buyContract?.volume !== n.buyContract?.volume
      ) {
        return false;
      }
    }
  }

  return true;
});

export default MatrixStrikeRow;
