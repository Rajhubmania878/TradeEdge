import React from 'react';
import { MarketFeedMetrics, UnderlyingStock, StockMarketSummary, Exchange } from '@/shared/types';
import { WifiOutlined, SafetyCertificateOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Space, Flex, Tag, Badge } from 'antd';
import { useTheme } from '@/app/providers/ThemeProvider';

interface StatusBarProps {
  metrics: MarketFeedMetrics;
  stock: UnderlyingStock;
  currentSpot: number;
  summary: StockMarketSummary;
  expiry: string;
  stk: string | number;
  exchange?: Exchange;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  metrics,
  stock,
  currentSpot,
  summary,
  expiry,
  stk,
  exchange = 'NSE'
}) => {
  const { isDark } = useTheme();

  const formatTime = (ts: number) => {
    const d = new Date(ts || Date.now());
    return d.toTimeString().split(' ')[0]; // Clean HH:MM:SS format without millisecond noise
  };

  const isLive = metrics?.status === 'LIVE';
  const effectiveStk = stk === 'AUTO' ? (stock?.strikeStep || 20) : stk;
  const derivSeg = exchange === 'BSE' ? 'BFO' : 'NFO';
  const cashSeg = exchange === 'BSE' ? 'BSE' : 'NSE';
  const basisVal = summary?.basis ?? 0;
  const isBasisPositive = basisVal >= 0;

  return (
    <div className="sticky bottom-0 z-30 w-full text-xs font-mono select-none shadow-md transition-colors py-1.5 sm:py-2 bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-3 px-3 sm:px-4 md:px-6">
        {/* Left: Financial Matrix Tickers in Grouped Pill Cards */}
        <Flex align="center" wrap="wrap" gap={8} className="w-full sm:w-auto">
          {/* Group 1: Symbol & Exchange Context */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stock?.symbol || 'RELIANCE'}
            </span>
            <Tag color="cyan" className="m-0 text-[10px] font-mono font-bold px-1.5 py-0 border-0">
              {exchange}
            </Tag>
            <Tag color="green" className="m-0 text-[10px] font-mono font-bold px-1.5 py-0 border-0">
              {derivSeg}
            </Tag>
          </div>

          {/* Group 2: Spot Cash Price */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800" title={`${cashSeg} Cash Spot Price`}>
            <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">
              {cashSeg} SPOT:
            </span>
            <span className="font-bold tabular-nums text-xs text-slate-900 dark:text-white">
              ₹{(summary?.cash ?? currentSpot ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Group 3: Futures Price & Basis */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">FUT:</span>
              <span className="font-bold tabular-nums text-xs text-slate-900 dark:text-white">
                ₹{(summary?.future ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">BASIS:</span>
              <span className={`font-bold tabular-nums text-xs ${isBasisPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isBasisPositive ? '+' : ''}₹{basisVal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Group 4: ATM Strike & Step */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">ATM:</span>
              <span className="font-bold tabular-nums text-xs text-amber-600 dark:text-amber-400">
                ₹{summary?.atm ?? '-'}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">STEP:</span>
              <span className="font-bold tabular-nums text-xs text-blue-600 dark:text-blue-400">
                ₹{effectiveStk}
              </span>
            </div>
          </div>

          {/* Group 5: Expiry & DTE */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">EXP:</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                {expiry}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">DTE:</span>
              <span className="font-bold tabular-nums text-xs text-slate-900 dark:text-white">
                {summary?.dte ?? 0}d
              </span>
            </div>
          </div>

          {/* Group 6: ATM Straddle Premium */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800" title="ATM Call LTP + ATM Put LTP">
            <span className="text-[10px] font-semibold text-slate-500 uppercase font-sans">STRADDLE:</span>
            <span className="font-bold tabular-nums text-xs text-purple-600 dark:text-purple-400">
              ₹{(summary?.atmStraddle ?? 0).toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              ({(summary?.atmStraddlePct ?? 0).toFixed(1)}%)
            </span>
          </div>
        </Flex>

        {/* Right: Institutional Feed & Connection Telemetry */}
        <Flex align="center" gap={10} className="text-xs text-slate-500 dark:text-slate-400">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <Badge status={isLive ? 'processing' : 'warning'} color={isLive ? '#10b981' : '#f59e0b'} />
            <span className={`text-xs font-mono font-bold ${isLive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isLive ? 'LIVE' : 'STALE'}
            </span>
          </div>

          {/* Connection Source */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 font-medium">
            <SafetyCertificateOutlined className="text-xs text-slate-400" />
            <span className="text-slate-700 dark:text-slate-200">{metrics?.angelConnected ? 'Angel One SmartAPI' : 'High-Fi Stream'}</span>
          </div>

          {/* Latency & Ping */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 font-medium">
            <WifiOutlined className="text-xs text-slate-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{metrics?.latencyMs ?? 0}ms</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{metrics?.dataAgeMs ?? 0}ms age</span>
          </div>

          {/* Tick Clock */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 font-medium">
            <ClockCircleOutlined className="text-xs text-slate-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatTime(metrics?.lastTickTime)} IST</span>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default StatusBar;
