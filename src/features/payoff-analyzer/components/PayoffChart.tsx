import React, { useState } from 'react';
import { StrategyPayoffResult, PayoffPoint } from '@/shared/types';
import { useTheme } from '@/app/providers';

interface PayoffChartProps {
  payoffResult: StrategyPayoffResult;
  buyStrike: number;
  sellStrike: number;
  lotSize: number;
}

export const PayoffChart: React.FC<PayoffChartProps> = React.memo(({
  payoffResult,
  buyStrike,
  sellStrike,
  lotSize
}) => {
  const { isDark } = useTheme();
  const [hoverPoint, setHoverPoint] = useState<PayoffPoint | null>(null);

  const { points, currentSpot, breakevens, maxProfitPerShare, maxLossPerShare, isUnlimitedLoss } =
    payoffResult;

  if (!points || points.length === 0) {
    return <div className="p-4 text-xs text-slate-400">Payoff data unavailable</div>;
  }

  // Determine chart scales
  const minSpot = points[0].spotPrice;
  const maxSpot = points[points.length - 1].spotPrice;

  const pnlValues = points.map(p => p.pnlPerShare);
  let minPnl = Math.min(...pnlValues);
  let maxPnl = Math.max(...pnlValues);

  // Add margin to Y-axis
  if (minPnl > 0) minPnl = 0;
  if (maxPnl < 0) maxPnl = 0;
  const pnlPadding = Math.max(10, (maxPnl - minPnl) * 0.15);
  const yMin = minPnl - pnlPadding;
  const yMax = maxPnl + pnlPadding;

  const width = 640;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (spot: number) => {
    return padding.left + ((spot - minSpot) / (maxSpot - minSpot)) * innerWidth;
  };

  const getY = (pnl: number) => {
    return padding.top + ((yMax - pnl) / (yMax - yMin)) * innerHeight;
  };

  const zeroY = getY(0);

  // Generate SVG path string
  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.spotPrice);
    const y = getY(pt.pnlPerShare);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const spotX = getX(currentSpot);
  const buyX = getX(buyStrike);
  const sellX = getX(sellStrike);

  // Theme-aware strokes & fills
  const zeroLineStroke = isDark ? '#475569' : '#94a3b8';
  const axisTextFill = isDark ? '#94a3b8' : '#64748b';
  const subTextFill = isDark ? '#64748b' : '#94a3b8';
  const beMarkerStroke = isDark ? '#e2e8f0' : '#475569';
  const beCircleFill = isDark ? '#ffffff' : '#0f172a';
  const beTextFill = isDark ? '#cbd5e1' : '#334155';

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 md:p-6 select-none transition-colors shadow-xs">
      <div className="flex flex-wrap items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-500 rounded inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Profit Zone</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-1 bg-rose-500 rounded inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Loss Zone</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Current Spot (₹{currentSpot.toLocaleString()})</span>
          </span>
        </div>

        {hoverPoint ? (
          <div className="font-mono text-xs text-right bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Spot: </span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">₹{hoverPoint.spotPrice.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400 ml-3">P&L/sh: </span>
            <span
              className={`font-semibold ${
                hoverPoint.pnlPerShare >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {hoverPoint.pnlPerShare >= 0 ? '+' : ''}₹{hoverPoint.pnlPerShare.toFixed(2)}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-3">Total: </span>
            <span
              className={`font-semibold ${
                hoverPoint.pnlPerLot >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {hoverPoint.pnlPerLot >= 0 ? '+' : ''}₹{hoverPoint.pnlPerLot.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Hover graph to inspect spot P&L</div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoverPoint(null)}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * width;
          const chartX = Math.max(padding.left, Math.min(width - padding.right, mouseX));
          const targetSpot = minSpot + ((chartX - padding.left) / innerWidth) * (maxSpot - minSpot);

          // Find closest point
          let closest = points[0];
          let minDiff = Math.abs(points[0].spotPrice - targetSpot);
          for (const p of points) {
            const diff = Math.abs(p.spotPrice - targetSpot);
            if (diff < minDiff) {
              minDiff = diff;
              closest = p;
            }
          }
          setHoverPoint(closest);
        }}
      >
        {/* Zero P&L Axis */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke={zeroLineStroke}
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {/* Vertical marker for Current Spot */}
        {spotX >= padding.left && spotX <= width - padding.right && (
          <g>
            <line
              x1={spotX}
              y1={padding.top}
              x2={spotX}
              y2={height - padding.bottom}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle cx={spotX} cy={getY(0)} r="3.5" fill="#06b6d4" />
          </g>
        )}

        {/* Buy Strike Marker */}
        {buyX >= padding.left && buyX <= width - padding.right && (
          <g>
            <line
              x1={buyX}
              y1={padding.top}
              x2={buyX}
              y2={height - padding.bottom}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={buyX} y={padding.top - 6} fill="#059669" fontSize="10" textAnchor="middle" className="font-mono font-semibold">
              Buy {buyStrike}
            </text>
          </g>
        )}

        {/* Sell Strike Marker */}
        {sellX >= padding.left && sellX <= width - padding.right && (
          <g>
            <line
              x1={sellX}
              y1={padding.top}
              x2={sellX}
              y2={height - padding.bottom}
              stroke="#f43f5e"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={sellX} y={padding.top - 6} fill="#e11d48" fontSize="10" textAnchor="middle" className="font-mono font-semibold">
              Sell {sellStrike}
            </text>
          </g>
        )}

        {/* Breakeven Markers */}
        {breakevens.map((be, i) => {
          const beX = getX(be);
          if (beX < padding.left || beX > width - padding.right) return null;
          return (
            <g key={i}>
              <line
                x1={beX}
                y1={zeroY - 14}
                x2={beX}
                y2={zeroY + 14}
                stroke={beMarkerStroke}
                strokeWidth="1.5"
              />
              <circle cx={beX} cy={zeroY} r="3" fill={beCircleFill} stroke={beMarkerStroke} />
              <text x={beX} y={zeroY + 22} fill={beTextFill} fontSize="9" textAnchor="middle" className="font-mono font-bold">
                BE: {Math.round(be)}
              </text>
            </g>
          );
        })}

        {/* Payoff Curve */}
        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

        {/* Hover Point Indicator */}
        {hoverPoint && (
          <g>
            <line
              x1={getX(hoverPoint.spotPrice)}
              y1={padding.top}
              x2={getX(hoverPoint.spotPrice)}
              y2={height - padding.bottom}
              stroke={isDark ? '#ffffff' : '#0f172a'}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            <circle
              cx={getX(hoverPoint.spotPrice)}
              cy={getY(hoverPoint.pnlPerShare)}
              r="4.5"
              fill={hoverPoint.pnlPerShare >= 0 ? '#10b981' : '#f43f5e'}
              stroke={isDark ? '#ffffff' : '#0f172a'}
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Y Axis Labels */}
        <text x={padding.left - 8} y={getY(maxPnl)} fill={axisTextFill} fontSize="9" textAnchor="end" className="font-mono">
          +₹{Math.round(maxPnl)}
        </text>
        <text x={padding.left - 8} y={zeroY + 3} fill={axisTextFill} fontSize="9" textAnchor="end" className="font-mono font-bold">
          ₹0
        </text>
        <text x={padding.left - 8} y={getY(minPnl)} fill={axisTextFill} fontSize="9" textAnchor="end" className="font-mono">
          {isUnlimitedLoss ? '-∞' : `-₹${Math.abs(Math.round(minPnl))}`}
        </text>

        {/* X Axis Spot Labels */}
        <text x={padding.left} y={height - 12} fill={subTextFill} fontSize="9" textAnchor="start" className="font-mono">
          ₹{Math.round(minSpot)}
        </text>
        <text x={width - padding.right} y={height - 12} fill={subTextFill} fontSize="9" textAnchor="end" className="font-mono">
          ₹{Math.round(maxSpot)}
        </text>
        <text x={(padding.left + width - padding.right) / 2} y={height - 10} fill={axisTextFill} fontSize="10" textAnchor="middle">
          Underlying Spot Price on Expiry (₹)
        </text>
      </svg>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Max Profit</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm block mt-0.5">
            +₹{maxProfitPerShare.toFixed(2)}/sh
          </span>
          <span className="text-slate-400 text-[11px] block mt-0.5">
            (+₹{(maxProfitPerShare * lotSize).toLocaleString()} / lot)
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Max Loss</span>
          <span
            className={`font-mono font-bold text-sm block mt-0.5 ${
              isUnlimitedLoss ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {isUnlimitedLoss ? 'Unlimited ⚠️' : `-₹${Math.abs(Number(maxLossPerShare)).toFixed(2)}/sh`}
          </span>
          {!isUnlimitedLoss && (
            <span className="text-slate-400 text-[11px] block mt-0.5">
              (-₹{Math.abs(Number(maxLossPerShare) * lotSize).toLocaleString()} / lot)
            </span>
          )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Breakeven(s)</span>
          <span className="text-slate-700 dark:text-slate-200 font-mono font-bold text-sm block mt-0.5">
            {breakevens.length > 0 ? breakevens.map(b => `₹${Math.round(b)}`).join(', ') : 'None'}
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Lot Size</span>
          <span className="text-slate-700 dark:text-slate-200 font-mono font-bold text-sm block mt-0.5">
            {lotSize} shares
          </span>
        </div>
      </div>
    </div>
  );
});
