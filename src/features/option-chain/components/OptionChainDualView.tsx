import React, { useState, useMemo } from 'react';
import { OptionContract, OptionType, Exchange } from '@/shared/types';
import { resolveTokenForExchange } from '@/data/universeManager';
import { Segmented, Tag, Tooltip, Empty, Space, Typography } from 'antd';
import { RiseOutlined, FallOutlined, EyeOutlined } from '@ant-design/icons';

interface OptionChainDualViewProps {
  contracts: Map<string, OptionContract>;
  strikes: number[];
  currentSpot: number;
  selectedSymbol: string;
  selectedExpiry: string;
  activeBuyStrike?: number;
  activeSellStrike?: number;
  onSelectStrike: (strike: number) => void;
  exchange?: Exchange;
}

export const OptionChainDualView: React.FC<OptionChainDualViewProps> = ({
  contracts,
  strikes,
  currentSpot,
  selectedSymbol,
  selectedExpiry,
  activeBuyStrike,
  activeSellStrike,
  onSelectStrike,
  exchange = 'NSE'
}) => {
  const [viewFilter, setViewFilter] = useState<'DUAL' | 'CE' | 'PE'>('DUAL');

  // Find ATM strike
  const atmStrike = useMemo(() => {
    if (strikes.length === 0) return currentSpot;
    let closest = strikes[0];
    let minDiff = Math.abs(currentSpot - closest);
    for (const s of strikes) {
      const diff = Math.abs(currentSpot - s);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    return closest;
  }, [strikes, currentSpot]);

  const getContract = (strike: number, type: OptionType): OptionContract | undefined => {
    const token = resolveTokenForExchange(selectedSymbol, selectedExpiry, strike, type, exchange);
    return contracts.get(token);
  };

  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString('en-IN');
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined) return '-';
    return `₹${price.toFixed(2)}`;
  };

  if (strikes.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <Empty
          description={
            <span className="font-sans text-xs text-slate-500">
              No listed option strikes found for {selectedSymbol} ({selectedExpiry}).
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors">
      {/* Action Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <Space size={10} align="center" wrap>
          <Tag color="cyan" className="font-sans font-bold text-xs px-2.5 py-0.5 m-0 rounded-md">
            {selectedSymbol}
          </Tag>
          <Typography.Text strong className="text-sm font-sans text-slate-900 dark:text-white">
            Option Chain Dual Matrix
          </Typography.Text>
          <Tag className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 m-0">
            Expiry: {selectedExpiry}
          </Tag>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Spot: <strong className="text-slate-900 dark:text-slate-100">₹{currentSpot.toLocaleString('en-IN')}</strong>
          </span>
        </Space>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">View:</span>
          <Segmented
            value={viewFilter}
            onChange={val => setViewFilter(val as any)}
            options={[
              { label: <span className="px-1.5 font-medium">Dual</span>, value: 'DUAL' },
              { label: <span className="px-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">Calls (CE)</span>, value: 'CE' },
              { label: <span className="px-1.5 text-rose-600 dark:text-rose-400 font-semibold">Puts (PE)</span>, value: 'PE' }
            ]}
            size="small"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto slim-scrollbar">
        <table className="w-full text-left text-xs whitespace-nowrap border-collapse select-none">
          {/* Streamlined Flat Header (No Nested Super-Row) */}
          <thead className="shadow-xs z-20 sticky top-0">
            <tr className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-sans uppercase tracking-wider border-b-2 border-slate-300 dark:border-slate-700 select-none h-11 backdrop-blur-md">
              {/* Call Columns */}
              {(viewFilter === 'DUAL' || viewFilter === 'CE') && (
                <>
                  <th className="py-2.5 px-3 text-right font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/30">
                    <Tooltip title="Call Open Interest"><span>CE OI</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/30">
                    <Tooltip title="Call Volume Traded"><span>CE Vol</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/30">
                    <Tooltip title="Call Implied Volatility"><span>CE IV</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/30">
                    <Tooltip title="Call Option Delta"><span>Delta</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-right text-emerald-800 dark:text-emerald-300 font-extrabold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/15 dark:bg-emerald-950/40">
                    CE Bid
                  </th>
                  <th className="py-2.5 px-2.5 text-right text-emerald-800 dark:text-emerald-300 font-extrabold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/15 dark:bg-emerald-950/40">
                    CE Ask
                  </th>
                  <th className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100 font-extrabold border-r-2 border-slate-400 dark:border-slate-600 whitespace-nowrap bg-slate-200/80 dark:bg-slate-900">
                    CE LTP
                  </th>
                </>
              )}

              {/* Center Strike Column */}
              <th className="py-2.5 px-4 text-center font-extrabold text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-slate-600 bg-slate-200 dark:bg-slate-900 whitespace-nowrap min-w-[104px] shadow-[2px_0_6px_-1px_rgba(0,0,0,0.12)]">
                STRIKE
              </th>

              {/* Put Columns */}
              {(viewFilter === 'DUAL' || viewFilter === 'PE') && (
                <>
                  <th className="py-2.5 px-3 text-left text-slate-900 dark:text-slate-100 font-extrabold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-slate-200/80 dark:bg-slate-900">
                    PE LTP
                  </th>
                  <th className="py-2.5 px-2.5 text-left text-rose-800 dark:text-rose-300 font-extrabold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-rose-500/15 dark:bg-rose-950/40">
                    PE Bid
                  </th>
                  <th className="py-2.5 px-2.5 text-left text-rose-800 dark:text-rose-300 font-extrabold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-rose-500/15 dark:bg-rose-950/40">
                    PE Ask
                  </th>
                  <th className="py-2.5 px-2.5 text-left font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/30">
                    <Tooltip title="Put Option Delta"><span>Delta</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-left font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/30">
                    <Tooltip title="Put Implied Volatility"><span>PE IV</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-2.5 text-left font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/30">
                    <Tooltip title="Put Volume Traded"><span>PE Vol</span></Tooltip>
                  </th>
                  <th className="py-2.5 px-3 text-left font-bold whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/30">
                    <Tooltip title="Put Open Interest"><span>PE OI</span></Tooltip>
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
            {strikes.map(strike => {
              const ce = getContract(strike, 'CE');
              const pe = getContract(strike, 'PE');
              const isAtm = strike === atmStrike;
              const isBuy = strike === activeBuyStrike;
              const isSell = strike === activeSellStrike;

              const isCallItm = strike < currentSpot;
              const isPutItm = strike > currentSpot;

              return (
                <tr
                  key={strike}
                  onClick={() => {
                    onSelectStrike(strike);
                  }}
                  className={`cursor-pointer transition-colors duration-100 ${
                    isAtm
                      ? 'bg-amber-500/15 font-semibold'
                      : isBuy
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/50 dark:hover:bg-emerald-950/70'
                      : isSell
                      ? 'bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-950/50 dark:hover:bg-rose-950/70'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900 bg-white dark:bg-slate-950'
                  }`}
                >
                  {/* Call Columns */}
                  {(viewFilter === 'DUAL' || viewFilter === 'CE') && (
                    <>
                      <td className={`py-2 px-3 text-right text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {formatNumber(ce?.oi)}
                      </td>
                      <td className={`py-2 px-2.5 text-right text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {formatNumber(ce?.volume)}
                      </td>
                      <td className={`py-2 px-2.5 text-right text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {ce?.iv !== null && ce?.iv !== undefined ? `${ce.iv.toFixed(1)}%` : '-'}
                      </td>
                      <td className={`py-2 px-2.5 text-right text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {ce?.delta !== null && ce?.delta !== undefined ? ce.delta.toFixed(2) : '-'}
                      </td>
                      <td className={`py-2 px-2.5 text-right font-medium text-emerald-700 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {formatPrice(ce?.bid)}
                      </td>
                      <td className={`py-2 px-2.5 text-right font-medium text-emerald-700 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800/80 ${isCallItm ? 'bg-amber-500/5' : ''}`}>
                        {formatPrice(ce?.ask)}
                      </td>
                      <td className={`py-2 px-3 text-right font-bold text-slate-900 dark:text-white border-r-2 border-slate-300 dark:border-slate-700 ${isCallItm ? 'bg-amber-500/10' : ''}`}>
                        {formatPrice(ce?.ltp)}
                      </td>
                    </>
                  )}

                  {/* Strike Column */}
                  <td className={`py-2 px-4 text-center font-bold border-r-2 border-slate-300 dark:border-slate-700 whitespace-nowrap min-w-[104px] shadow-[2px_0_6px_-1px_rgba(0,0,0,0.06)] ${
                    isAtm
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                  }`}>
                    <div className="flex items-center justify-center gap-1.5 font-mono">
                      <span>{strike.toLocaleString('en-IN')}</span>
                      {isAtm && (
                        <span className="text-[9px] bg-slate-950 text-amber-400 px-1 py-0.2 rounded font-bold font-mono">
                          ATM
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Put Columns */}
                  {(viewFilter === 'DUAL' || viewFilter === 'PE') && (
                    <>
                      <td className={`py-2 px-3 text-left font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/10' : ''}`}>
                        {formatPrice(pe?.ltp)}
                      </td>
                      <td className={`py-2 px-2.5 text-left font-medium text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {formatPrice(pe?.bid)}
                      </td>
                      <td className={`py-2 px-2.5 text-left font-medium text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {formatPrice(pe?.ask)}
                      </td>
                      <td className={`py-2 px-2.5 text-left text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {pe?.delta !== null && pe?.delta !== undefined ? pe.delta.toFixed(2) : '-'}
                      </td>
                      <td className={`py-2 px-2.5 text-left text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {pe?.iv !== null && pe?.iv !== undefined ? `${pe.iv.toFixed(1)}%` : '-'}
                      </td>
                      <td className={`py-2 px-2.5 text-left text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/80 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {formatNumber(pe?.volume)}
                      </td>
                      <td className={`py-2 px-3 text-left text-slate-600 dark:text-slate-400 ${isPutItm ? 'bg-amber-500/5' : ''}`}>
                        {formatNumber(pe?.oi)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionChainDualView;
