import React from 'react';
import { RatioStrategyRow } from '@/shared/types';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { PayoffChart } from '@/features/payoff-analyzer';
import { Button, Space, Flex, Tag, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

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
    <div className="bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 shadow-2xl p-3.5 sm:p-6 md:p-8 font-sans transition-colors text-xs text-slate-800 dark:text-slate-100">
      <div className="max-w-[1920px] mx-auto space-y-4 sm:space-y-6">
        {/* Header Bar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <Space size={12} align="center" wrap>
            <Text strong className="text-sm sm:text-base text-slate-900 dark:text-white font-mono tracking-tight">
              SELECTED STRATEGY: {strategy.underlying} {strategy.ratioStr} {strategy.optionType === 'CE' ? 'CALL' : 'PUT'} RATIO SPREAD
            </Text>
            <Text type="secondary" className="font-mono text-xs whitespace-nowrap">
              Expiry: <Text strong className="text-slate-900 dark:text-slate-200">{strategy.expiry}</Text>
            </Text>
            <Text type="secondary" className="hidden sm:inline">·</Text>
            <Text type="secondary" className="font-mono text-xs whitespace-nowrap">
              Lot Size: <Text strong className="text-slate-900 dark:text-slate-200">{strategy.lotSize}</Text>
            </Text>
          </Space>

          <Button
            type="text"
            size="middle"
            icon={<CloseOutlined className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-base" />}
            onClick={onClose}
          />
        </Flex>

        {/* Two-Column Grid: Primary Risk vs Contract Legs & Secondary Greeks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* COLUMN 1: LEVEL 1 PRIMARY METRICS (High Visual Priority) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Text type="secondary" strong className="text-xs uppercase tracking-wider block font-mono">
              PRIMARY RISK & RETURN PROFILE
            </Text>

            <div className="grid grid-cols-2 gap-3.5">
              {/* NET ENTRY */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
                <Text type="secondary" strong className="text-[11px] uppercase block">NET ENTRY</Text>
                <div className={`text-lg font-semibold mt-1 tabular-nums ${
                  isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {formatCurrency(netEntry)} {isCredit ? 'Credit' : 'Debit'}
                </div>
                <Text type="secondary" className="text-[11px] block mt-1 tabular-nums">
                  ₹{(Math.abs(netEntry) * strategy.lotSize).toLocaleString('en-IN')} / lot
                </Text>
              </div>

              {/* CURRENT MTM */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
                <Text type="secondary" strong className="text-[11px] uppercase block">CURRENT MTM</Text>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                  ₹0.00
                </div>
                <Text type="secondary" className="text-[11px] block mt-1 tabular-nums">
                  At Spot ₹{currentSpot.toLocaleString('en-IN')}
                </Text>
              </div>

              {/* MAX PROFIT */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
                <Text strong className="text-[11px] uppercase text-emerald-600 dark:text-emerald-400 block">MAX PROFIT</Text>
                <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  {formatCurrency(payoffResult.maxProfitPerShare)} / sh
                </div>
                <Text type="secondary" className="text-[11px] block mt-1 tabular-nums">
                  ₹{payoffResult.maxProfitPerLot.toLocaleString('en-IN')} / lot
                </Text>
              </div>

              {/* MAX LOSS */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
                <Text strong className="text-[11px] uppercase text-rose-600 dark:text-rose-400 block">MAX LOSS</Text>
                <div className="mt-1">
                  {payoffResult.isUnlimitedLoss || payoffResult.maxLossPerShare === 'Unlimited' ? (
                    <Tag color="error" className="font-semibold font-mono !mr-0 px-2 py-0.5 text-xs">
                      UNLIMITED ⚠️
                    </Tag>
                  ) : (
                    <span className="text-base font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatCurrency(payoffResult.maxLossPerShare)} / sh
                    </span>
                  )}
                </div>
                <Text type="secondary" className="text-[11px] block mt-1 tabular-nums">
                  {payoffResult.isUnlimitedLoss ? 'Beyond Sell Strike' : `₹${payoffResult.maxLossPerLot.toLocaleString('en-IN')} / lot`}
                </Text>
              </div>
            </div>

            {/* BREAKEVEN(S) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono flex items-center justify-between shadow-xs">
              <Text type="secondary" strong className="text-xs uppercase">BREAKEVEN(S):</Text>
              <Text strong className="text-amber-600 dark:text-amber-400 text-sm tabular-nums">
                {payoffResult.breakevens.length > 0
                  ? payoffResult.breakevens.map(b => `₹${b.toLocaleString('en-IN')}`).join(' · ')
                  : '-'}
              </Text>
            </div>
          </div>

          {/* COLUMN 2: CONTRACT LEGS & SECONDARY METRICS */}
          <div className="lg:col-span-7 space-y-4">
            <Text type="secondary" strong className="text-xs uppercase tracking-wider block font-mono">
              CONTRACT LEGS & LIQUIDITY METRICS
            </Text>

            {/* Legs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              {/* Long Leg */}
              <div className="bg-emerald-50/50 dark:bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Text strong className="text-xs text-emerald-700 dark:text-emerald-400 uppercase">
                    BUY ({strategy.longQty}x)
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {strategy.longQty * strategy.lotSize} shares
                  </Text>
                </div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{strategy.buyStrike} {strategy.optionType}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                  Ask Price: <Text strong className="text-emerald-600 dark:text-emerald-400">{strategy.buyAsk !== null ? `₹${strategy.buyAsk.toFixed(2)}` : '-'}</Text>
                </div>
              </div>

              {/* Short Leg */}
              <div className="bg-rose-50/50 dark:bg-slate-950 p-4 rounded-xl border border-rose-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Text strong className="text-xs text-rose-700 dark:text-rose-400 uppercase">
                    SELL ({strategy.shortQty}x)
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {strategy.shortQty * strategy.lotSize} shares
                  </Text>
                </div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{strategy.sellStrike} {strategy.optionType}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                  Bid Price: <Text strong className="text-rose-600 dark:text-rose-400">{strategy.sellBid !== null ? `₹${strategy.sellBid.toFixed(2)}` : '-'}</Text>
                </div>
              </div>
            </div>

            {/* Secondary Greeks & Liquidity Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Text type="secondary" strong className="text-[11px] block uppercase">BUY IV / SELL IV</Text>
                <Text strong className="text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                  {strategy.buyIv !== null ? `${strategy.buyIv.toFixed(1)}%` : '-'} / {strategy.sellIv !== null ? `${strategy.sellIv.toFixed(1)}%` : '-'}
                </Text>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Text type="secondary" strong className="text-[11px] block uppercase">COMBINED OI</Text>
                <Text strong className="text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                  {strategy.combinedOi !== null ? `${((strategy.combinedOi) / 1000).toFixed(1)}k` : '-'}
                </Text>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Text type="secondary" strong className="text-[11px] block uppercase">COMBINED VOL</Text>
                <Text strong className="text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                  {strategy.combinedVolume !== null ? `${((strategy.combinedVolume) / 1000).toFixed(1)}k` : '-'}
                </Text>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Text type="secondary" strong className="text-[11px] block uppercase">GAP MULTIPLE</Text>
                <Text strong className="text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                  ₹{strategy.actualGap} ({strategy.gapSteps} steps)
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* PAYOFF CHART AT BOTTOM */}
        <div className="pt-3">
          <Text type="secondary" strong className="text-xs uppercase tracking-wider block mb-3 font-mono">
            EXPIRY PAYOFF DIAGRAM & SCENARIOS
          </Text>
          <PayoffChart
            payoffResult={payoffResult}
            buyStrike={strategy.buyStrike}
            sellStrike={strategy.sellStrike}
            lotSize={strategy.lotSize}
          />
        </div>
      </div>
    </div>
  );
};
