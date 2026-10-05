import React from 'react';
import { RatioStrategyRow } from '@/shared/types';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { PayoffChart } from '@/features/payoff-analyzer';
import { ProCard } from '@ant-design/pro-components';
import { Button, Space, Flex, Tag, Typography, Tooltip, Badge } from 'antd';
import {
  CloseOutlined,
  StockOutlined,
  CompassOutlined,
  DashboardOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface SelectedStrategyPanelProps {
  strategy: RatioStrategyRow | null;
  onClose: () => void;
  currentSpot: number;
}

export const SelectedStrategyPanel: React.FC<SelectedStrategyPanelProps> = ({
  strategy,
  onClose,
  currentSpot
}) => {
  if (!strategy) return null;

  const legConfigs = strategy.legs.map(leg => ({
    side: leg.side,
    optionType: leg.optionType,
    strike: leg.strike,
    quantity: leg.quantity,
    price: leg.executionPrice || 0
  }));

  const netEntry = strategy.executableNetEntry || 0;
  const payoffResult = evaluateStrategyPayoff(
    legConfigs,
    netEntry,
    currentSpot,
    strategy.lotSize
  );

  const isCredit = netEntry < 0;

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    return `₹${Math.abs(val).toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 shadow-2xl p-4 sm:p-6 font-sans transition-colors text-xs text-slate-800 dark:text-slate-100">
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Ant Design Pro Header Ribbon */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <Flex align="center" gap={10} wrap="wrap">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-base font-bold font-sans shrink-0">
              <StockOutlined />
            </div>

            <Flex align="center" gap={8} wrap="wrap">
              <Tag color="cyan" className="font-sans font-bold text-xs px-2.5 py-0.5 m-0 rounded-md">
                {strategy.underlying}
              </Tag>

              <Tag color="blue" className="font-sans font-bold text-xs px-2.5 py-0.5 m-0 rounded-md">
                {strategy.ratioStr} {strategy.optionType === 'CE' ? 'CALL' : 'PUT'} RATIO SPREAD
              </Tag>

              <Tag className="font-sans text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 m-0">
                Expiry: <strong className="font-mono text-slate-900 dark:text-white">{strategy.expiry}</strong>
              </Tag>

              <Tag className="font-sans text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 m-0">
                Lot Size: <strong className="font-mono text-slate-900 dark:text-white">{strategy.lotSize}</strong>
              </Tag>
            </Flex>
          </Flex>

          <Button
            type="text"
            size="middle"
            icon={<CloseOutlined className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base" />}
            onClick={onClose}
            className="rounded-xl"
            aria-label="Close"
          />
        </Flex>

        {/* Ant Design Pro Grid: Symmetrical Two-Column Layout */}
        <ProCard
          ghost
          gutter={[16, 16]}
          wrap
        >
          {/* COLUMN 1: PRIMARY RISK & RETURN PROFILE */}
          <ProCard
            colSpan={{ xs: 24, lg: 10 }}
            bordered
            headerBordered
            className="rounded-2xl shadow-2xs bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            title={
              <Flex align="center" gap={8} className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                <CompassOutlined className="text-blue-500" />
                <span>Primary Risk & Return Profile</span>
              </Flex>
            }
          >
            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-3">
                {/* NET ENTRY */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                    Net Entry
                  </div>
                  <div className={`text-base sm:text-lg font-bold mt-1 tabular-nums font-mono flex items-center gap-1.5 ${
                    isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    <span>{formatCurrency(netEntry)}</span>
                    <Tag color={isCredit ? 'success' : 'default'} className="m-0 text-[10px] font-bold px-1.5 py-0 font-sans">
                      {isCredit ? 'Credit' : 'Debit'}
                    </Tag>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums font-mono">
                    ₹{(Math.abs(netEntry) * strategy.lotSize).toLocaleString('en-IN')} / lot
                  </div>
                </div>

                {/* CURRENT MTM */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                    Current MTM
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums font-mono">
                    ₹0.00
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums font-mono">
                    At Spot ₹{currentSpot.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* MAX PROFIT */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-sans">
                    Max Profit
                  </div>
                  <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums font-mono">
                    {formatCurrency(payoffResult.maxProfitPerShare)} / sh
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums font-mono">
                    ₹{payoffResult.maxProfitPerLot.toLocaleString('en-IN')} / lot
                  </div>
                </div>

                {/* MAX LOSS */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-sans">
                    Max Loss
                  </div>
                  <div className="mt-1">
                    {payoffResult.isUnlimitedLoss || payoffResult.maxLossPerShare === 'Unlimited' ? (
                      <Tag color="error" className="font-bold font-mono !mr-0 px-2 py-0.5 text-xs rounded-md">
                        UNLIMITED ⚠️
                      </Tag>
                    ) : (
                      <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums font-mono">
                        {formatCurrency(payoffResult.maxLossPerShare)} / sh
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums font-mono">
                    {payoffResult.isUnlimitedLoss ? 'Beyond Sell Strike' : `₹${payoffResult.maxLossPerLot.toLocaleString('en-IN')} / lot`}
                  </div>
                </div>
              </div>

              {/* BREAKEVEN BANNER */}
              <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-sans uppercase">
                  Breakeven Targets:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {payoffResult.breakevens.length > 0 ? (
                    payoffResult.breakevens.map((b, idx) => (
                      <Tag key={idx} color="gold" className="font-mono font-bold text-xs px-2 py-0.5 m-0 rounded-md">
                        ₹{b.toLocaleString('en-IN')}
                      </Tag>
                    ))
                  ) : (
                    <Tag className="font-mono text-xs m-0">None</Tag>
                  )}
                </div>
              </div>
            </div>
          </ProCard>

          {/* COLUMN 2: CONTRACT LEGS & LIQUIDITY STRUCTURE */}
          <ProCard
            colSpan={{ xs: 24, lg: 14 }}
            bordered
            headerBordered
            className="rounded-2xl shadow-2xs bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            title={
              <Flex align="center" gap={8} className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                <DashboardOutlined className="text-emerald-500" />
                <span>Contract Legs & Execution Details</span>
              </Flex>
            }
          >
            <div className="space-y-3 font-sans">
              {/* Legs Symmetrical Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Long Leg Card */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-300/80 dark:border-emerald-800/60 space-y-1.5 shadow-2xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1">
                      <RiseOutlined /> Buy ({strategy.longQty}x)
                    </span>
                    <Tag className="font-mono text-[10px] m-0 border-emerald-300 bg-white/80 dark:bg-emerald-900/60 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300">
                      {strategy.longQty * strategy.lotSize} shares
                    </Tag>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums font-mono">
                    ₹{strategy.buyStrike} {strategy.optionType}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    Ask Price: <strong className="text-emerald-600 dark:text-emerald-400">{strategy.buyAsk !== null ? `₹${strategy.buyAsk.toFixed(2)}` : '-'}</strong>
                  </div>
                </div>

                {/* Short Leg Card */}
                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-300/80 dark:border-rose-800/60 space-y-1.5 shadow-2xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase flex items-center gap-1">
                      <FallOutlined /> Sell ({strategy.shortQty}x)
                    </span>
                    <Tag className="font-mono text-[10px] m-0 border-rose-300 bg-white/80 dark:bg-rose-900/60 dark:border-rose-700 text-rose-800 dark:text-rose-300">
                      {strategy.shortQty * strategy.lotSize} shares
                    </Tag>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums font-mono">
                    ₹{strategy.sellStrike} {strategy.optionType}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    Bid Price: <strong className="text-rose-600 dark:text-rose-400">{strategy.sellBid !== null ? `₹${strategy.sellBid.toFixed(2)}` : '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Secondary Greeks & Liquidity Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase font-sans">Buy / Sell IV</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                    {strategy.buyIv !== null ? `${strategy.buyIv.toFixed(1)}%` : '-'} / {strategy.sellIv !== null ? `${strategy.sellIv.toFixed(1)}%` : '-'}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase font-sans">Combined OI</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                    {strategy.combinedOi !== null ? `${((strategy.combinedOi) / 1000).toFixed(1)}k` : '-'}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase font-sans">Combined Vol</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                    {strategy.combinedVolume !== null ? `${((strategy.combinedVolume) / 1000).toFixed(1)}k` : '-'}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase font-sans">Gap Multiple</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                    ₹{strategy.actualGap} ({strategy.gapSteps} steps)
                  </div>
                </div>
              </div>
            </div>
          </ProCard>
        </ProCard>

        {/* Ant Design Pro Card: Payoff Diagram Section */}
        <ProCard
          bordered
          headerBordered
          className="rounded-2xl shadow-2xs bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
          title={
            <Flex align="center" gap={8} className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              <LineChartOutlined className="text-blue-500" />
              <span>Expiry Payoff Diagram & Scenarios</span>
            </Flex>
          }
        >
          <PayoffChart
            payoffResult={payoffResult}
            buyStrike={strategy.buyStrike}
            sellStrike={strategy.sellStrike}
            lotSize={strategy.lotSize}
          />
        </ProCard>
      </div>
    </div>
  );
};

export default SelectedStrategyPanel;
