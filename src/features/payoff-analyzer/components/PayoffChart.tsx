import React, { useState, useMemo } from 'react';
import { StrategyPayoffResult, PayoffPoint } from '@/shared/types';
import { useTheme } from '@/app/providers';
import { Space, Typography, Tag, Flex, Tooltip, Radio } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  AimOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

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
    return <div className="p-4 text-xs text-slate-400 font-sans">Payoff data unavailable</div>;
  }

  // Determine chart scales
  const minSpot = points[0].spotPrice;
  const maxSpot = points[points.length - 1].spotPrice;

  const pnlValues = points.map(p => p.pnlPerShare);
  let minPnl = Math.min(...pnlValues);
  let maxPnl = Math.max(...pnlValues);

  // Add symmetrical breathing room to Y-axis
  if (minPnl > 0) minPnl = 0;
  if (maxPnl < 0) maxPnl = 0;
  const pnlPadding = Math.max(12, (maxPnl - minPnl) * 0.20);
  const yMin = minPnl - pnlPadding;
  const yMax = maxPnl + pnlPadding;

  const width = 860;
  const height = 320;
  const padding = { top: 56, right: 40, bottom: 48, left: 75 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (spot: number) => {
    return padding.left + ((spot - minSpot) / (maxSpot - minSpot)) * innerWidth;
  };

  const getY = (pnl: number) => {
    return padding.top + ((yMax - pnl) / (yMax - yMin)) * innerHeight;
  };

  const zeroY = getY(0);

  // Calculate Payoff Line Path (D)
  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.spotPrice);
    const y = getY(pt.pnlPerShare);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  // Generate Area Fill Paths for Profit (>0) and Loss (<0)
  const { profitAreaD, lossAreaD } = useMemo(() => {
    if (points.length === 0) return { profitAreaD: '', lossAreaD: '' };

    const firstX = getX(points[0].spotPrice);
    const lastX = getX(points[points.length - 1].spotPrice);

    // Full area closed to zero line
    const areaClosed = `${pathD} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;

    return {
      profitAreaD: areaClosed,
      lossAreaD: areaClosed
    };
  }, [points, pathD, zeroY]);

  const spotX = getX(currentSpot);
  const buyX = getX(buyStrike);
  const sellX = getX(sellStrike);

  // Stagger calculation to ensure zero text collision
  const isStrikersClose = Math.abs(buyX - sellX) < 95;
  const buyLabelY = isStrikersClose ? 20 : 28;
  const sellLabelY = isStrikersClose ? 38 : 28;

  // Theme-aware styles
  const gridLineStroke = isDark ? '#334155' : '#e2e8f0';
  const zeroLineStroke = isDark ? '#64748b' : '#94a3b8';
  const axisTextFill = isDark ? '#94a3b8' : '#64748b';
  const subTextFill = isDark ? '#64748b' : '#94a3b8';
  const beMarkerStroke = isDark ? '#f59e0b' : '#d97706';
  const badgeBg = isDark ? '#0f172a' : '#ffffff';

  // Grid tick values
  const yTicks = [
    { pnl: maxPnl, label: `+₹${Math.round(maxPnl)}` },
    { pnl: maxPnl / 2, label: `+₹${Math.round(maxPnl / 2)}` },
    { pnl: 0, label: '₹0' },
    { pnl: minPnl / 2, label: `-₹${Math.abs(Math.round(minPnl / 2))}` },
    { pnl: minPnl, label: isUnlimitedLoss ? '-∞' : `-₹${Math.abs(Math.round(minPnl))}` }
  ].filter((t, i, arr) => i === 0 || Math.abs(t.pnl - arr[i - 1].pnl) > (yMax - yMin) * 0.12);

  // Spot X-ticks
  const xTicks = useMemo(() => {
    const step = (maxSpot - minSpot) / 5;
    return [0, 1, 2, 3, 4, 5].map(i => Math.round(minSpot + i * step));
  }, [minSpot, maxSpot]);

  // Active inspector point (defaults to current spot if not hovering)
  const activeInspectionPoint = hoverPoint || {
    spotPrice: currentSpot,
    pnlPerShare: payoffResult.points.find(p => Math.abs(p.spotPrice - currentSpot) < 5)?.pnlPerShare || 0,
    pnlPerLot: (payoffResult.points.find(p => Math.abs(p.spotPrice - currentSpot) < 5)?.pnlPerShare || 0) * lotSize
  };

  return (
    <div className="relative select-none font-sans">
      {/* Ant Design Pro Top Control & Real-Time Telemetry Bar */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="pb-3.5 border-b border-slate-200/80 dark:border-slate-800 mb-2 text-xs min-h-[44px]">
        {/* Left: Strategic Legend */}
        <Space size={14} align="center" wrap className="text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-1.5 bg-emerald-500 rounded-full inline-block shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Profit Zone</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-1.5 bg-rose-500 rounded-full inline-block shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Loss Zone</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block ring-2 ring-cyan-500/25" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Current Spot (₹{currentSpot.toLocaleString('en-IN')})</span>
          </span>
        </Space>

        {/* Right: Floating Glassmorphic P&L Inspector */}
        <div className="h-8 flex items-center justify-end">
          <div className="font-mono text-xs bg-slate-50/90 dark:bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3.5">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-sans font-medium text-[11px]">Spot:</span>
              <span className="text-slate-900 dark:text-white font-bold">
                ₹{activeInspectionPoint.spotPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-sans font-medium text-[11px]">P&L/sh:</span>
              <span
                className={`font-bold ${
                  activeInspectionPoint.pnlPerShare >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {activeInspectionPoint.pnlPerShare >= 0 ? '+' : ''}₹{activeInspectionPoint.pnlPerShare.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-slate-400 font-sans font-medium text-[11px]">Total:</span>
              <span
                className={`font-bold ${
                  activeInspectionPoint.pnlPerLot >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {activeInspectionPoint.pnlPerLot >= 0 ? '+' : ''}₹{activeInspectionPoint.pnlPerLot.toLocaleString('en-IN')}
              </span>
              <Tag
                color={activeInspectionPoint.pnlPerShare >= 0 ? 'success' : 'error'}
                className="font-sans font-bold text-[10px] ml-1.5 px-1.5 py-0 m-0 rounded"
              >
                {activeInspectionPoint.pnlPerShare >= 0 ? 'PROFIT' : 'LOSS'}
              </Tag>
            </div>
          </div>
        </div>
      </Flex>

      {/* Main SVG Vector Payoff Chart with Area Shading and Grid */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoverPoint(null)}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * width;
          const chartX = Math.max(padding.left, Math.min(width - padding.right, mouseX));
          const targetSpot = minSpot + ((chartX - padding.left) / innerWidth) * (maxSpot - minSpot);

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
        <defs>
          {/* Institutional Gradients for Profit & Loss Regions */}
          <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id="lossAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.28" />
          </linearGradient>

          {/* Clip Paths to separate Profit (above zero) from Loss (below zero) */}
          <clipPath id="profitClip">
            <rect x={padding.left} y={padding.top} width={innerWidth} height={zeroY - padding.top} />
          </clipPath>

          <clipPath id="lossClip">
            <rect x={padding.left} y={zeroY} width={innerWidth} height={height - padding.bottom - zeroY} />
          </clipPath>
        </defs>

        {/* Subtle Horizontal Background Gridlines */}
        {yTicks.map((tick, i) => {
          const y = getY(tick.pnl);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={gridLineStroke}
                strokeDasharray={tick.pnl === 0 ? 'none' : '3 3'}
                strokeWidth={tick.pnl === 0 ? '1.5' : '0.8'}
              />
              <text
                x={padding.left - 12}
                y={y + 3.5}
                fill={tick.pnl === 0 ? (isDark ? '#e2e8f0' : '#0f172a') : axisTextFill}
                fontSize="10"
                fontWeight={tick.pnl === 0 ? '700' : '500'}
                textAnchor="end"
                className="font-mono"
              >
                {tick.label}
              </text>
            </g>
          );
        })}

        {/* Vertical Spot Gridlines */}
        {xTicks.map((spotVal, idx) => {
          const x = getX(spotVal);
          return (
            <g key={idx}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke={gridLineStroke}
                strokeDasharray="2 4"
                strokeWidth="0.6"
              />
              <text
                x={x}
                y={height - padding.bottom + 18}
                fill={subTextFill}
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
                className="font-mono"
              >
                ₹{spotVal.toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}

        {/* Profit Region Shaded Area */}
        <path
          d={profitAreaD}
          fill="url(#profitAreaGrad)"
          clipPath="url(#profitClip)"
        />

        {/* Loss Region Shaded Area */}
        <path
          d={lossAreaD}
          fill="url(#lossAreaGrad)"
          clipPath="url(#lossClip)"
        />

        {/* Zero P&L Solid Reference Axis */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke={zeroLineStroke}
          strokeWidth="1.5"
        />

        {/* Vertical Guide Beacon: Current Spot Price */}
        {spotX >= padding.left && spotX <= width - padding.right && (
          <g>
            <line
              x1={spotX}
              y1={padding.top}
              x2={spotX}
              y2={height - padding.bottom}
              stroke="#06b6d4"
              strokeWidth="1.6"
              strokeDasharray="4 4"
            />
            <circle cx={spotX} cy={zeroY} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}

        {/* Buy Strike Marker with Ant Design Pro Badge */}
        {buyX >= padding.left && buyX <= width - padding.right && (
          <g>
            <line
              x1={buyX}
              y1={padding.top}
              x2={buyX}
              y2={height - padding.bottom}
              stroke="#10b981"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <g transform={`translate(${buyX}, ${buyLabelY})`}>
              <rect
                x="-40"
                y="-11"
                width="80"
                height="20"
                rx="6"
                fill={badgeBg}
                stroke="#10b981"
                strokeWidth="1.4"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
              />
              <circle cx="-28" cy="-1" r="3" fill="#10b981" />
              <text
                x="4"
                y="3"
                fill="#059669"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                className="font-mono"
              >
                Buy {buyStrike}
              </text>
            </g>
          </g>
        )}

        {/* Sell Strike Marker with Ant Design Pro Badge */}
        {sellX >= padding.left && sellX <= width - padding.right && (
          <g>
            <line
              x1={sellX}
              y1={padding.top}
              x2={sellX}
              y2={height - padding.bottom}
              stroke="#f43f5e"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <g transform={`translate(${sellX}, ${sellLabelY})`}>
              <rect
                x="-40"
                y="-11"
                width="80"
                height="20"
                rx="6"
                fill={badgeBg}
                stroke="#f43f5e"
                strokeWidth="1.4"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
              />
              <circle cx="-28" cy="-1" r="3" fill="#f43f5e" />
              <text
                x="4"
                y="3"
                fill="#e11d48"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                className="font-mono"
              >
                Sell {sellStrike}
              </text>
            </g>
          </g>
        )}

        {/* Breakeven Targets on Zero Line */}
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
                strokeWidth="1.6"
              />
              <circle cx={beX} cy={zeroY} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <g transform={`translate(${beX}, ${zeroY + 24})`}>
                <rect
                  x="-36"
                  y="-10"
                  width="72"
                  height="18"
                  rx="5"
                  fill={badgeBg}
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
                />
                <text
                  x="0"
                  y="2"
                  fill={isDark ? '#fbbf24' : '#b45309'}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  className="font-mono"
                >
                  BE: ₹{Math.round(be)}
                </text>
              </g>
            </g>
          );
        })}

        {/* Primary Payoff Line Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#0284c7"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 2px 3px rgba(2,132,199,0.25))"
        />

        {/* Interactive Crosshair & Cursor Inspector */}
        {hoverPoint && (
          <g>
            <line
              x1={getX(hoverPoint.spotPrice)}
              y1={padding.top}
              x2={getX(hoverPoint.spotPrice)}
              y2={height - padding.bottom}
              stroke={isDark ? '#94a3b8' : '#475569'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <circle
              cx={getX(hoverPoint.spotPrice)}
              cy={getY(hoverPoint.pnlPerShare)}
              r="5.5"
              fill={hoverPoint.pnlPerShare >= 0 ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
            />
          </g>
        )}

        {/* X-Axis Label */}
        <text
          x={(padding.left + width - padding.right) / 2}
          y={height - 8}
          fill={axisTextFill}
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          className="font-sans tracking-wide"
        >
          Underlying Spot Price on Expiry (₹)
        </text>
      </svg>
    </div>
  );
});

export default PayoffChart;
