import React from 'react';
import { RatioStrategyRow } from '@/shared/types';
import { PayoffChart } from '@/features/payoff-analyzer';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { Drawer, Tag, Space, Typography } from 'antd';

const { Text } = Typography;

interface StrategyDetailDrawerProps {
  strategy: RatioStrategyRow | null;
  onClose: () => void;
  currentSpot: number;
}

export const StrategyDetailDrawer: React.FC<StrategyDetailDrawerProps> = ({
  strategy,
  onClose,
  currentSpot
}) => {
  if (!strategy) return null;

  // Convert legs for payoff engine
  const legConfigs = React.useMemo(() => {
    return strategy.legs.map(leg => ({
      side: leg.side,
      optionType: leg.optionType,
      strike: leg.strike,
      quantity: leg.quantity,
      price: leg.executionPrice || 0
    }));
  }, [strategy.legs]);

  const netEntry = strategy.executableNetEntry || 0;
  const payoffResult = React.useMemo(() => {
    return evaluateStrategyPayoff(
      legConfigs,
      netEntry,
      currentSpot,
      strategy.lotSize
    );
  }, [legConfigs, netEntry, currentSpot, strategy.lotSize]);

  const isCredit = netEntry < 0;

  // Expiry spot scenarios
  const spotScenarios = React.useMemo(() => [
    { key: 's1', label: '-5.0%', spot: Math.round(currentSpot * 0.95) },
    { key: 's2', label: '-2.5%', spot: Math.round(currentSpot * 0.975) },
    { key: 's3', label: 'Current Spot', spot: Math.round(currentSpot) },
    { key: 's4', label: 'Buy Strike', spot: strategy.buyStrike },
    { key: 's5', label: 'Sell Strike (Peak)', spot: strategy.sellStrike },
    { key: 's6', label: '+2.5%', spot: Math.round(currentSpot * 1.025) },
    { key: 's7', label: '+5.0%', spot: Math.round(currentSpot * 1.05) },
    { key: 's8', label: '+10.0%', spot: Math.round(currentSpot * 1.10) }
  ], [currentSpot, strategy.buyStrike, strategy.sellStrike]);

  return (
    <Drawer
      open={!!strategy}
      onClose={onClose}
      width={680}
      title={
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Text strong className="text-slate-900 dark:text-white text-sm font-mono">
              {strategy.underlying} {strategy.ratioStr} {strategy.optionType === 'CE' ? 'CALL' : 'PUT'} RATIO SPREAD
            </Text>
            <Tag color="cyan" className="font-mono text-[11px] font-semibold m-0">
              {strategy.expiry}
            </Tag>
          </div>
          <Text type="secondary" className="text-xs font-sans block">
            Lot: {strategy.lotSize} shares · Gap: ₹{strategy.actualGap} ({strategy.gapSteps} steps)
          </Text>
        </div>
      }
    >
      <div className="space-y-4 text-xs font-sans text-slate-800 dark:text-slate-200">
        {/* Strategy Legs Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <Text type="secondary" strong className="uppercase tracking-wider text-[11px] block">
            CONTRACT LEGS & EXECUTION PRICING
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* BUY Leg */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-emerald-500/30 font-mono space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <Tag color="success" className="font-semibold m-0 text-[11px]">
                  BUY LEG (+{strategy.longQty}x)
                </Tag>
                <Text type="secondary" className="text-[11px]">
                  {strategy.longQty * strategy.lotSize} shares
                </Text>
              </div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                ₹{strategy.buyStrike} {strategy.optionType}
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Ask Price: <Text strong className="text-emerald-600 dark:text-emerald-400">₹{strategy.buyAsk?.toFixed(2) || '—'}</Text>
              </div>
              <Text type="secondary" className="text-[11px] block">
                Bid: ₹{strategy.buyBid?.toFixed(2) || '—'} · IV: {strategy.buyIv?.toFixed(1) || '—'}%
              </Text>
            </div>

            {/* SELL Leg */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-rose-500/30 font-mono space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <Tag color="error" className="font-semibold m-0 text-[11px]">
                  SELL LEG (-{strategy.shortQty}x)
                </Tag>
                <Text type="secondary" className="text-[11px]">
                  {strategy.shortQty * strategy.lotSize} shares
                </Text>
              </div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                ₹{strategy.sellStrike} {strategy.optionType}
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Bid Price: <Text strong className="text-rose-600 dark:text-rose-400">₹{strategy.sellBid?.toFixed(2) || '—'}</Text>
              </div>
              <Text type="secondary" className="text-[11px] block">
                Ask: ₹{strategy.sellAsk?.toFixed(2) || '—'} · IV: {strategy.sellIv?.toFixed(1) || '—'}%
              </Text>
            </div>
          </div>
        </div>

        {/* Financial & Greeks Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <Text type="secondary" strong className="text-[11px] block uppercase">NET ENTRY</Text>
            <Text strong className={`text-sm block mt-0.5 ${
              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {isCredit ? `-₹${Math.abs(netEntry).toFixed(2)}` : `₹${netEntry.toFixed(2)}`}
            </Text>
            <Text type="secondary" className="text-[11px]">
              ₹{(Math.abs(netEntry) * strategy.lotSize).toLocaleString('en-IN')} / lot
            </Text>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <Text type="secondary" strong className="text-[11px] block uppercase">MAX PROFIT</Text>
            <Text strong className="text-sm text-emerald-600 dark:text-emerald-400 block mt-0.5">
              ₹{payoffResult.maxProfitPerShare?.toFixed(2) || '—'} / sh
            </Text>
            <Text type="secondary" className="text-[11px]">
              ₹{payoffResult.maxProfitPerLot?.toLocaleString('en-IN')} / lot
            </Text>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <Text type="secondary" strong className="text-[11px] block uppercase">MAX LOSS</Text>
            <Text strong className="text-sm text-rose-600 dark:text-rose-400 block mt-0.5">
              {payoffResult.isUnlimitedLoss || payoffResult.maxLossPerShare === 'Unlimited'
                ? 'UNLIMITED ⚠️'
                : typeof payoffResult.maxLossPerShare === 'number'
                ? `₹${payoffResult.maxLossPerShare.toFixed(2)} / sh`
                : `${payoffResult.maxLossPerShare} / sh`}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {payoffResult.isUnlimitedLoss ? 'Beyond Sell Strike' : `₹${payoffResult.maxLossPerLot?.toLocaleString('en-IN')} / lot`}
            </Text>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <Text type="secondary" strong className="text-[11px] block uppercase">BREAKEVEN(S)</Text>
            <Text strong className="text-sm text-amber-600 dark:text-amber-400 block mt-0.5">
              {payoffResult.breakevens.length > 0
                ? payoffResult.breakevens.map(b => `₹${b}`).join(', ')
                : 'None'}
            </Text>
            <Text type="secondary" className="text-[11px]">At Expiry</Text>
          </div>
        </div>

        {/* Interactive Payoff Chart */}
        <div className="space-y-2">
          <Text type="secondary" strong className="uppercase tracking-wider text-[11px] block">
            PAYOFF AT EXPIRY DIAGRAM
          </Text>
          <PayoffChart
            payoffResult={payoffResult}
            buyStrike={strategy.buyStrike}
            sellStrike={strategy.sellStrike}
            lotSize={strategy.lotSize}
          />
        </div>

        {/* Scenario Table */}
        <div className="space-y-2">
          <Text type="secondary" strong className="uppercase tracking-wider text-[11px] block">
            EXPIRY SPOT SCENARIOS
          </Text>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden font-mono text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-1.5 px-3">Scenario</th>
                  <th className="py-1.5 px-3 text-right">Spot Price</th>
                  <th className="py-1.5 px-3 text-right">P&L / Share</th>
                  <th className="py-1.5 px-3 text-right">Total P&L / Lot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
                {spotScenarios.map(sc => {
                  const pt = payoffResult.points.find(p => Math.abs(p.spotPrice - sc.spot) < 5) || {
                    spotPrice: sc.spot,
                    pnlPerShare: 0,
                    pnlPerLot: 0
                  };
                  const isPos = pt.pnlPerShare >= 0;

                  return (
                    <tr key={sc.key} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{sc.label}</td>
                      <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">₹{sc.spot.toLocaleString()}</td>
                      <td className={`py-1.5 px-3 text-right font-bold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isPos ? '+' : ''}₹{pt.pnlPerShare.toFixed(2)}
                      </td>
                      <td className={`py-1.5 px-3 text-right font-bold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isPos ? '+' : ''}₹{pt.pnlPerLot.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
