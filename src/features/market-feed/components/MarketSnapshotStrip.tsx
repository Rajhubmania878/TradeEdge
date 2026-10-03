import React from 'react';
import { StockMarketSummary, MarketFeedMetrics, Exchange } from '@/shared/types';
import { Flex, Space, Tag, Typography, Button, Badge } from 'antd';
import {
  ClockCircleOutlined,
  BuildOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  AimOutlined,
  BarChartOutlined,
  TagsOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface MarketSnapshotStripProps {
  symbol: string;
  exchange: Exchange;
  summary: StockMarketSummary;
  metrics: MarketFeedMetrics;
  onRefreshLive?: () => void;
}

export const MarketSnapshotStrip: React.FC<MarketSnapshotStripProps> = ({
  symbol,
  exchange,
  summary,
  metrics,
  onRefreshLive
}) => {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatSigned = (val: number) => {
    const prefix = val >= 0 ? '+₹' : '-₹';
    return `${prefix}${Math.abs(val).toFixed(2)}`;
  };

  const timeString = new Date(metrics.lastTickTime || Date.now()).toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isBasisPositive = summary.basis >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-2xs font-sans text-slate-900 dark:text-slate-100">
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={8}
        className="w-full text-xs"
      >
        {/* Left: Security Symbol Badge */}
        <Space size={8} align="center">
          <Space size={6} align="center">
            <BuildOutlined className="text-slate-500 text-sm" />
            <Text strong className="text-sm font-sans tracking-tight text-slate-900 dark:text-white">
              {symbol}
            </Text>
          </Space>
          <Tag color="cyan" className="m-0 font-sans font-semibold text-[11px] px-1.5 py-0">
            {exchange}
          </Tag>
        </Space>

        {/* Center: Market Snapshot Metrics Strip */}
        <Flex align="center" wrap="wrap" gap={10}>
          {/* CASH */}
          <Space size={6} align="center">
            <Text type="secondary" className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
              <TagsOutlined /> CASH
            </Text>
            <Text strong className="font-mono text-xs tabular-nums bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700">
              {formatCurrency(summary.cash)}
            </Text>
          </Space>

          {/* FUTURE */}
          <Space size={6} align="center">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <RiseOutlined /> FUTURE
            </Text>
            <Text strong className="font-mono text-xs tabular-nums text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
              {formatCurrency(summary.future)}
            </Text>
          </Space>

          {/* BASIS */}
          <Space size={6} align="center">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-rose-500 dark:text-rose-400 flex items-center gap-1">
              <FallOutlined /> BASIS
            </Text>
            <Text
              strong
              className={`font-mono text-xs tabular-nums px-2 py-0.5 rounded-md border ${
                isBasisPositive
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800'
              }`}
            >
              {formatSigned(summary.basis)}
            </Text>
          </Space>

          {/* ATM */}
          <Space size={6} align="center">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AimOutlined /> ATM
            </Text>
            <Text strong className="font-mono text-xs tabular-nums text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800">
              ₹{summary.atm.toLocaleString('en-IN')}
            </Text>
          </Space>

          {/* STRADDLE */}
          <Space size={6} align="center">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <BarChartOutlined /> STRADDLE
            </Text>
            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400 text-xs tabular-nums bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800 flex items-center gap-1.5">
              ₹{(summary.atmStraddle || 0).toFixed(2)}
              <Text strong className="text-[11px] text-purple-700 dark:text-purple-300">
                {summary.atmStraddlePct || 0}%
              </Text>
            </span>
          </Space>

          {/* DTE */}
          <Space size={6} align="center">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <CalendarOutlined /> DTE
            </Text>
            <Text strong className="font-mono text-xs tabular-nums text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800">
              {summary.dte}d
            </Text>
          </Space>
        </Flex>

        {/* Right: Live Feed Indicator */}
        <Space size={8} align="center">
          <Badge status="processing" color="#10b981" text={<Text strong className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">LIVE</Text>} />
          <Button
            size="small"
            type="text"
            icon={<ClockCircleOutlined className="text-slate-400 text-xs" />}
            onClick={onRefreshLive}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-mono h-6 px-1.5"
          >
            {timeString}
          </Button>
        </Space>
      </Flex>
    </div>
  );
};

export default MarketSnapshotStrip;
