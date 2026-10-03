import React from 'react';
import { RatioStrategyRow } from '@/shared/types';
import { EyeOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Empty, Tooltip } from 'antd';

interface RatioSpreadGridProps {
  rows: RatioStrategyRow[];
  onSelectRow: (row: RatioStrategyRow) => void;
  selectedRowId?: string;
  currentSpot: number;
  lotSize: number;
}

interface RatioSpreadGridRowProps {
  row: RatioStrategyRow;
  isSelected: boolean;
  currentSpot: number;
  onSelectRow: (row: RatioStrategyRow) => void;
  formatCurrency: (val: number | null | undefined, prefix?: string) => string;
  formatNumber: (val: number | null | undefined) => string;
}

const RatioSpreadGridRow = React.memo<RatioSpreadGridRowProps>(({
  row,
  isSelected,
  currentSpot,
  onSelectRow,
  formatCurrency,
  formatNumber
}) => {
  const isCredit = (row.executableNetEntry || 0) < 0;
  const isDebit = (row.executableNetEntry || 0) > 0;
  const buyDistPct = Math.round(((row.buyStrike - currentSpot) / currentSpot) * 1000) / 10;
  const isAtm = Math.abs(row.buyStrike - currentSpot) < 15;

  return (
    <tr
      onClick={() => onSelectRow(row)}
      className={`cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'bg-emerald-500/15 text-slate-900 dark:text-white dark:bg-slate-800 ring-1 ring-emerald-500'
          : 'hover:bg-slate-100 dark:hover:bg-slate-900/80 bg-white dark:bg-slate-950'
      }`}
    >
      {/* 1. Frozen: Buy Strike & Qty (Left-aligned) */}
      <td className="py-2.5 px-4 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800/80 text-left whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-900 dark:text-white font-bold text-sm tabular-nums">
            {row.buyStrike}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            +{row.longQty}x
          </span>
          {isAtm && (
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              ATM
            </span>
          )}
        </div>
        <span className="text-[11px] block tabular-nums mt-0.5 text-slate-500 dark:text-slate-400">
          {buyDistPct >= 0 ? `+${buyDistPct.toFixed(1)}%` : `${buyDistPct.toFixed(1)}%`} from spot
        </span>
      </td>

      {/* 2. Buy Ask / Bid Depth (Right-aligned) */}
      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-300 font-bold text-xs">
            Ask: {formatCurrency(row.buyAsk)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ({row.buyAskQty !== null ? `${row.buyAskQty}q` : '-'})
          </span>
        </div>
        <span className="text-[11px] block tabular-nums mt-0.5 text-slate-500 dark:text-slate-400">
          Bid: {formatCurrency(row.buyBid)} · Sprd: {row.buySpreadPct !== null ? `${row.buySpreadPct.toFixed(1)}%` : '-'}
        </span>
      </td>

      {/* 3. Sell Strike & Qty (Left-aligned) */}
      <td className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800/80 text-left whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-800 dark:text-slate-200 font-bold text-sm tabular-nums">
            {row.sellStrike}
          </span>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
            -{row.shortQty}x
          </span>
        </div>
        <span className="text-[11px] block tabular-nums mt-0.5 text-slate-500 dark:text-slate-400">
          Actual Gap: ₹{row.actualGap} ({row.gapSteps} steps)
        </span>
      </td>

      {/* 4. Sell Bid / Ask Depth (Right-aligned) */}
      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 tabular-nums">
          <span className="text-rose-600 dark:text-rose-300 font-bold text-xs">
            Bid: {formatCurrency(row.sellBid)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ({row.sellBidQty !== null ? `${row.sellBidQty}q` : '-'})
          </span>
        </div>
        <span className="text-[11px] block tabular-nums mt-0.5 text-slate-500 dark:text-slate-400">
          Ask: {formatCurrency(row.sellAsk)} · Sprd: {row.sellSpreadPct !== null ? `${row.sellSpreadPct.toFixed(1)}%` : '-'}
        </span>
      </td>

      {/* 5. Ratio & Gap Summary (Center-aligned) */}
      <td className="py-3 px-3.5 text-center border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded text-xs font-bold font-mono border border-slate-200 dark:border-slate-700">
          {row.ratioStr}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 font-mono">
          {row.gapSteps} steps
        </span>
      </td>

      {/* 6. Net Executable Entry (Right-aligned with tabular numerals) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        {row.executableNetEntry === null ? (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        ) : (
          <div>
            <div
              className={`text-sm font-extrabold flex items-center justify-end gap-1 tabular-nums ${
                isCredit ? 'text-emerald-600 dark:text-emerald-400' : isDebit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-300'
              }`}
            >
              {isCredit ? (
                <>
                  <RiseOutlined className="text-xs inline" />
                  <span>+₹{Math.abs(row.executableNetEntry).toFixed(2)}</span>
                </>
              ) : isDebit ? (
                <>
                  <FallOutlined className="text-xs inline" />
                  <span>-₹{Math.abs(row.executableNetEntry).toFixed(2)}</span>
                </>
              ) : (
                <span>₹0.00</span>
              )}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                {isCredit ? 'Credit' : 'Debit'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block tabular-nums mt-0.5">
              Total: {isCredit ? '+' : '-'}₹
              {Math.abs(row.executableTotalEntry || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / lot
            </span>
          </div>
        )}
      </td>

      {/* 7. Mid Entry & Cost of Slippage (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        <div className="text-xs text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
          {row.midNetEntry !== null ? (
            <span>
              {row.midNetEntry < 0 ? '+' : '-'}₹{Math.abs(row.midNetEntry).toFixed(2)}
            </span>
          ) : (
            '-'
          )}
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block tabular-nums mt-0.5" title="Slippage vs mid execution">
          Slippage: {row.slippageCost !== null ? `₹${row.slippageCost.toFixed(2)}` : '-'}
        </span>
      </td>

      {/* 8. Max Profit (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        {row.maxProfitPerShare !== null ? (
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs tabular-nums">
              +₹{row.maxProfitPerShare.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block tabular-nums mt-0.5">
              +₹{(row.maxProfitPerLot || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          '-'
        )}
      </td>

      {/* 9. Max Loss (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        {row.isUnlimitedLoss ? (
          <span className="font-bold text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Unlimited ⚠️
          </span>
        ) : row.maxLossPerShare !== null ? (
          <div>
            <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs tabular-nums">
              -₹{Math.abs(Number(row.maxLossPerShare)).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block tabular-nums mt-0.5">
              -₹{Math.abs(Number(row.maxLossPerLot)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          '-'
        )}
      </td>

      {/* 10. Breakevens (Center-aligned) */}
      <td className="py-3 px-3.5 text-center border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        {row.breakevens.length > 0 ? (
          <div className="space-y-1 tabular-nums">
            {row.breakevens.map((be, i) => (
              <span key={i} className="text-xs text-slate-800 dark:text-slate-200 block font-semibold">
                ₹{Math.round(be)}{' '}
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  ({row.breakevenDistPcts[i] >= 0 ? '+' : ''}
                  {row.breakevenDistPcts[i]}%)
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">-</span>
        )}
      </td>

      {/* 11. Net Greeks (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        <div className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">
          Δ: <span className={(row.netDelta || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
            {row.netDelta !== null ? row.netDelta.toFixed(3) : '-'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
          Θ: {row.lotTheta !== null ? `+₹${row.lotTheta.toFixed(0)}/day` : '-'}
        </div>
      </td>

      {/* 12. Implied Volatility (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 tabular-nums whitespace-nowrap">
        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
          {row.buyIv !== null ? `${row.buyIv.toFixed(1)}%` : '-'}
        </span>
        <span className="text-slate-400 dark:text-slate-600 mx-1.5">/</span>
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.sellIv !== null ? `${row.sellIv.toFixed(1)}%` : '-'}
        </span>
      </td>

      {/* 13. Open Interest (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        <div className="text-xs text-slate-800 dark:text-slate-200 tabular-nums">
          {formatNumber(row.buyOi)} / {formatNumber(row.sellOi)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
          Comb: {formatNumber(row.combinedOi)}
        </div>
      </td>

      {/* 14. Volume (Right-aligned) */}
      <td className="py-3 px-3.5 text-right border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap">
        <div className="text-xs text-slate-700 dark:text-slate-300 tabular-nums font-medium">
          {formatNumber(row.combinedVolume)}
        </div>
      </td>

      {/* 15. Action Button (Center-aligned, strict single-line) */}
      <td className="py-3 px-3.5 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSelectRow(row);
          }}
          className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors border border-slate-200 dark:border-slate-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <EyeOutlined className="text-emerald-600 dark:text-emerald-400 inline text-xs" />
          <span>Payoff</span>
        </button>
      </td>
    </tr>
  );
});

export const RatioSpreadGrid: React.FC<RatioSpreadGridProps> = ({
  rows,
  onSelectRow,
  selectedRowId,
  currentSpot,
  lotSize
}) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <Empty
          description={
            <div className="space-y-1 font-sans">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No ratio spread structures match the active filters
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Try relaxing the net entry filter, increasing strike range, or lowering minimum OI/Volume thresholds.
              </p>
            </div>
          }
        />
      </div>
    );
  }

  const formatCurrency = React.useCallback((val: number | null | undefined, prefix = '₹') => {
    if (val === null || val === undefined) return '-';
    return `${prefix}${val.toFixed(2)}`;
  }, []);

  const formatNumber = React.useCallback((val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    if (val === 0) return '0';
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString('en-IN');
  }, []);

  return (
    <div className="w-full overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-sans transition-colors slim-scrollbar">
      <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
        {/* Table Header: Semantic Alignment Matching Cell Data */}
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs font-mono select-none sticky top-0 z-10 h-11">
            {/* Frozen Left Column: Left aligned text */}
            <th className="py-2.5 px-4 font-bold text-slate-900 dark:text-white sticky left-0 bg-slate-200 dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 text-left min-w-[140px]">
              Buy Leg (Strike · Qty)
            </th>
            {/* Numeric Depth: Right aligned */}
            <th className="py-2.5 px-3.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 text-right min-w-[140px]">
              <Tooltip title="Executable Ask price for Buying leg and best available Bid">
                <span>Buy Ask / Bid ℹ️</span>
              </Tooltip>
            </th>
            {/* Sell Leg: Left aligned text */}
            <th className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 text-left min-w-[140px]">
              Sell Leg (Strike · Qty)
            </th>
            {/* Sell Depth: Right aligned */}
            <th className="py-2.5 px-3.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 text-right min-w-[140px]">
              <Tooltip title="Executable Bid price for Selling leg and best available Ask">
                <span>Sell Bid / Ask ℹ️</span>
              </Tooltip>
            </th>
            {/* Discrete Ratio: Center aligned */}
            <th className="py-2.5 px-3.5 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-w-[90px]">
              Ratio · Gap
            </th>

            {/* Core Strategy Pricing: Right aligned for magnitude comparison */}
            <th className="py-2.5 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 min-w-[140px]">
              <Tooltip title="Net Executable Entry: (Long Qty × Ask) - (Short Qty × Bid). Positive = Debit, Negative = Credit">
                <span>Net Entry ℹ️</span>
              </Tooltip>
            </th>
            <th className="py-2.5 px-3.5 text-right font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              <Tooltip title="Theoretical Mid Price Entry & Execution Slippage Cost">
                <span>Mid Entry / Slippage</span>
              </Tooltip>
            </th>

            {/* Payoff & Risk: Right aligned */}
            <th className="py-2.5 px-3.5 text-right font-bold text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              Max Profit
            </th>
            <th className="py-2.5 px-3.5 text-right font-bold text-slate-800 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              Max Loss
            </th>
            {/* Breakeven points: Center aligned */}
            <th className="py-2.5 px-3.5 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              Breakeven(s)
            </th>

            {/* Greeks & IV: Right aligned */}
            <th className="py-2.5 px-3.5 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              <Tooltip title="Net Strategy Delta and Daily Theta Decay per Lot">
                <span>Net Greeks (Δ · Θ)</span>
              </Tooltip>
            </th>
            <th className="py-2.5 px-3.5 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 min-w-[110px]">
              IV (Buy / Sell)
            </th>

            {/* Liquidity: Right aligned */}
            <th className="py-2.5 px-3.5 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
              Open Interest
            </th>
            <th className="py-2.5 px-3.5 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 min-w-[100px]">
              Volume
            </th>

            {/* Action: Center aligned */}
            <th className="py-2.5 px-3.5 text-center font-semibold text-slate-600 dark:text-slate-400 min-w-[100px] whitespace-nowrap">
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
          {rows.map(row => (
            <RatioSpreadGridRow
              key={row.id}
              row={row}
              isSelected={selectedRowId === row.id}
              currentSpot={currentSpot}
              onSelectRow={onSelectRow}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
