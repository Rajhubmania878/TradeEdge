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
    return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
  };

  const isLive = metrics?.status === 'LIVE';
  const effectiveStk = stk === 'AUTO' ? (stock?.strikeStep || 20) : stk;
  const derivSeg = exchange === 'BSE' ? 'BFO' : 'NFO';
  const cashSeg = exchange === 'BSE' ? 'BSE_CM' : 'NSE_CM';
  const basisVal = summary?.basis ?? 0;
  const isBasisPositive = basisVal >= 0;

  // Explicit, fail-safe color tokens guaranteeing 100% visibility in Light and Dark modes
  const colors = {
    bg: isDark ? '#0e1422' : '#ffffff',
    border: isDark ? '#1e293b' : '#e2e8f0',
    primaryText: isDark ? '#f8fafc' : '#0f172a',
    secondaryText: isDark ? '#94a3b8' : '#475569',
    mutedText: isDark ? '#64748b' : '#64748b',
    divider: isDark ? '#334155' : '#cbd5e1',
    gain: isDark ? '#34d399' : '#059669',
    loss: isDark ? '#fb7185' : '#e11d48',
    atm: isDark ? '#fbbf24' : '#d97706',
    stk: isDark ? '#60a5fa' : '#2563eb',
    straddle: isDark ? '#c084fc' : '#7c3aed',
  };

  return (
    <div
      className="sticky bottom-0 z-30 w-full text-xs font-mono select-none shadow-md transition-colors py-2 sm:py-2.5 border-t"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.primaryText
      }}
    >
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-3 sm:px-4 md:px-6">
        {/* Left: Financial Matrix Tickers with Guaranteed Inline Contrast */}
        <Flex align="center" wrap="wrap" gap={12} className="w-full sm:w-auto">
          {/* Symbol & Exchange */}
          <Space size={8} align="center">
            <span
              className="text-sm font-sans font-bold tracking-tight"
              style={{ color: colors.primaryText }}
            >
              {stock?.symbol || 'RELIANCE'}
            </span>
            <Tag color="cyan" className="m-0 text-[11px] font-mono font-semibold px-1.5 py-0 border-0">
              {exchange}
            </Tag>
            <Tag color="green" className="m-0 text-[11px] font-mono font-semibold px-1.5 py-0 border-0">
              {derivSeg} ACTIVE
            </Tag>
          </Space>

          <span style={{ color: colors.divider }} className="font-bold">|</span>

          {/* CASH / SPOT */}
          <div className="flex items-baseline gap-1" title={`${cashSeg} Cash Spot Price`}>
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              {cashSeg}:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.primaryText }}
            >
              ₹{(summary?.cash ?? currentSpot ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* FUT */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              FUT:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.primaryText }}
            >
              ₹{(summary?.future ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* BASIS */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              BASIS:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: isBasisPositive ? colors.gain : colors.loss }}
            >
              {isBasisPositive ? '+' : ''}₹{basisVal.toFixed(2)}
            </span>
          </div>

          {/* ATM */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              ATM:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.atm }}
            >
              ₹{summary?.atm ?? '-'}
            </span>
          </div>

          {/* STK */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              STK:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.stk }}
            >
              ₹{effectiveStk}
            </span>
          </div>

          {/* EXP */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              EXP:
            </span>
            <span
              className="font-bold text-xs uppercase"
              style={{ color: colors.primaryText }}
            >
              {expiry}
            </span>
          </div>

          {/* DTE */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              DTE:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.primaryText }}
            >
              {summary?.dte ?? 0}d
            </span>
          </div>

          {/* STRADDLE */}
          <div className="flex items-baseline gap-1" title="ATM Call LTP + ATM Put LTP">
            <span
              className="font-semibold text-[11px] uppercase tracking-wider"
              style={{ color: colors.secondaryText }}
            >
              ATM STRADDLE:
            </span>
            <span
              className="font-bold tabular-nums text-xs"
              style={{ color: colors.straddle }}
            >
              ₹{(summary?.atmStraddle ?? 0).toFixed(2)}
            </span>
            <span
              className="font-semibold text-[11px]"
              style={{ color: colors.secondaryText }}
            >
              ({(summary?.atmStraddlePct ?? 0).toFixed(1)}%)
            </span>
          </div>
        </Flex>

        {/* Right: Institutional Feed & Connection Status */}
        <Flex align="center" gap={12} className="text-[11px]" style={{ color: colors.secondaryText }}>
          {/* Connection status tag */}
          <Space size={6} align="center">
            <Badge status={isLive ? 'processing' : 'warning'} color={isLive ? '#10b981' : '#f59e0b'} />
            <span
              className="text-xs font-mono font-bold"
              style={{ color: isLive ? colors.gain : colors.atm }}
            >
              {isLive ? 'LIVE' : 'STALE'}
            </span>
          </Space>

          <span style={{ color: colors.divider }} className="hidden sm:inline font-bold">/</span>

          {/* Source mode */}
          <div className="hidden sm:flex items-center gap-1.5 font-medium" style={{ color: colors.secondaryText }}>
            <SafetyCertificateOutlined className="text-xs" style={{ color: colors.mutedText }} />
            <span>{metrics?.angelConnected ? 'Angel One SmartAPI' : 'High-Fi Stream'}</span>
          </div>

          <span style={{ color: colors.divider }} className="hidden md:inline font-bold">/</span>

          {/* Latency & Age */}
          <div className="hidden lg:flex items-center gap-2 font-medium" style={{ color: colors.secondaryText }}>
            <span className="flex items-center gap-1">
              <WifiOutlined className="text-xs" style={{ color: colors.mutedText }} />
              <span className="font-bold" style={{ color: colors.primaryText }}>{metrics?.latencyMs ?? 0}ms</span>
            </span>
            <span>·</span>
            <span>{metrics?.dataAgeMs ?? 0}ms age</span>
          </div>

          <span style={{ color: colors.divider }} className="hidden xl:inline font-bold">/</span>

          {/* Last Tick Time */}
          <div className="hidden xl:flex items-center gap-1 font-medium" style={{ color: colors.secondaryText }}>
            <ClockCircleOutlined className="text-xs" style={{ color: colors.mutedText }} />
            <span className="font-bold" style={{ color: colors.primaryText }}>{formatTime(metrics?.lastTickTime)} IST</span>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default StatusBar;
