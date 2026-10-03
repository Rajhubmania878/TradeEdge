import React, { useMemo } from 'react';
import {
  OptionContract,
  UnderlyingStock,
  OptionType,
  RatioStrategyRow,
  Exchange
} from '@/shared/types';
import { resolveTokenForExchange } from '@/data/universeManager';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { AppstoreOutlined } from '@ant-design/icons';
import { Table, Button, Tag, Tooltip, Empty, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface AllRatiosScannerProps {
  stock: UnderlyingStock;
  expiry: string;
  optionType: OptionType;
  contracts: Map<string, OptionContract>;
  allStrikes: number[];
  currentSpot: number;
  onSelectStrategy: (strategy: RatioStrategyRow) => void;
  exchange?: Exchange;
}

export const AllRatiosScanner: React.FC<AllRatiosScannerProps> = ({
  stock,
  expiry,
  optionType,
  contracts,
  allStrikes,
  currentSpot,
  onSelectStrategy,
  exchange = 'NSE'
}) => {
  const comparisonRatios = [
    { long: 1, short: 1, label: '1:1' },
    { long: 1, short: 2, label: '1:2' },
    { long: 1, short: 3, label: '1:3' },
    { long: 1, short: 4, label: '1:4' },
    { long: 2, short: 3, label: '2:3' },
    { long: 2, short: 5, label: '2:5' },
    { long: 3, short: 5, label: '3:5' }
  ];

  const atmStrike = useMemo(() => {
    let closest = allStrikes[0] || currentSpot;
    let minDiff = Math.abs(currentSpot - closest);
    for (const s of allStrikes) {
      const diff = Math.abs(currentSpot - s);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    return closest;
  }, [allStrikes, currentSpot]);

  const atmIdx = allStrikes.indexOf(atmStrike);
  const sampleIndices = [
    Math.max(0, atmIdx - 1),
    atmIdx,
    Math.min(allStrikes.length - 1, atmIdx + 1),
    Math.min(allStrikes.length - 1, atmIdx + 2)
  ].filter((v, i, a) => a.indexOf(v) === i);

  const gapStepsList = [1, 2, 3];

  // Fast O(1) Strike-Indexed Contract Lookup Map (RULE 6.5)
  const strikeMap = useMemo(() => {
    const map = new Map<string, OptionContract>();
    for (const c of contracts.values()) {
      map.set(`${c.strike}_${c.optionType}`, c);
    }
    return map;
  }, [contracts]);

  const generatedRows = useMemo(() => {
    const list: RatioStrategyRow[] = [];

    for (const r of comparisonRatios) {
      for (const buyIdx of sampleIndices) {
        for (const gSteps of gapStepsList) {
          const sellIdx = optionType === 'CE' ? buyIdx + gSteps : buyIdx - gSteps;
          if (sellIdx < 0 || sellIdx >= allStrikes.length) continue;

          const buyStrike = allStrikes[buyIdx];
          const sellStrike = allStrikes[sellIdx];
          const actualGap = Math.abs(sellStrike - buyStrike);

          const buyToken = resolveTokenForExchange(stock.symbol, expiry, buyStrike, optionType, exchange);
          const sellToken = resolveTokenForExchange(stock.symbol, expiry, sellStrike, optionType, exchange);

          const buyContract = contracts.get(buyToken) || strikeMap.get(`${buyStrike}_${optionType}`);
          const sellContract = contracts.get(sellToken) || strikeMap.get(`${sellStrike}_${optionType}`);

          if (!buyContract || !sellContract) continue;

          const buyAsk = buyContract.ask ?? (buyContract.ltp ? Math.round((buyContract.ltp + 0.1) * 20) / 20 : null);
          const buyBid = buyContract.bid ?? (buyContract.ltp ? Math.max(0.05, Math.round((buyContract.ltp - 0.1) * 20) / 20) : null);
          const sellBid = (sellContract.bid !== null && sellContract.bid !== undefined && sellContract.bid > 0)
            ? sellContract.bid
            : (sellContract.ltp ? Math.max(0.05, Math.round((sellContract.ltp - 0.1) * 20) / 20) : null);
          const sellAsk = (sellContract.ask !== null && sellContract.ask !== undefined && sellContract.ask > 0)
            ? sellContract.ask
            : (sellContract.ltp ? Math.round((sellContract.ltp + 0.1) * 20) / 20 : null);

          if (buyAsk === null || sellBid === null) continue;

          const netEntry = Math.round((r.long * buyAsk - r.short * sellBid) * 100) / 100;
          const totalEntry = Math.round(netEntry * stock.lotSize * 100) / 100;

          const legs = [
            {
              side: 'BUY' as const,
              optionType,
              strike: buyStrike,
              quantity: r.long,
              actualQuantity: r.long * stock.lotSize,
              contract: buyContract,
              executionPrice: buyAsk
            },
            {
              side: 'SELL' as const,
              optionType,
              strike: sellStrike,
              quantity: r.short,
              actualQuantity: r.short * stock.lotSize,
              contract: sellContract,
              executionPrice: sellBid
            }
          ];

          // O(1) Analytical Peak Calculations for 2-leg Ratio Spreads
          const strikeDiff = Math.abs(sellStrike - buyStrike);
          const peakProfitPerShare = r.long * strikeDiff - netEntry;
          const maxProfitPerShare = Math.round(peakProfitPerShare * 100) / 100;
          const maxProfitPerLot = Math.round(peakProfitPerShare * stock.lotSize * 100) / 100;

          const isCall = optionType === 'CE';
          const isUnlimitedLoss = isCall ? r.short > r.long : false;

          let maxLossPerShare: number | 'Unlimited' = isUnlimitedLoss ? 'Unlimited' : 0;
          let maxLossPerLot: number | 'Unlimited' = isUnlimitedLoss ? 'Unlimited' : 0;

          if (!isUnlimitedLoss) {
            // For puts or 1:1, calculate max loss at S = 0 or bounds
            const lossAtZero = !isCall ? (r.long * buyStrike - r.short * sellStrike) - netEntry : -netEntry;
            maxLossPerShare = Math.round(Math.min(lossAtZero, -netEntry) * 100) / 100;
            maxLossPerLot = Math.round(Number(maxLossPerShare) * stock.lotSize * 100) / 100;
          }

          const breakevens: number[] = [];
          if (netEntry > 0) {
            // Lower/entry breakeven when debit paid
            const beEntry = isCall ? buyStrike + netEntry / r.long : buyStrike - netEntry / r.long;
            breakevens.push(Math.round(beEntry * 10) / 10);
          }
          if (r.short > r.long && peakProfitPerShare > 0) {
            // Upper/breakout breakeven
            const beUpper = isCall
              ? sellStrike + peakProfitPerShare / (r.short - r.long)
              : sellStrike - peakProfitPerShare / (r.short - r.long);
            if (beUpper > 0) {
              breakevens.push(Math.round(beUpper * 10) / 10);
            }
          }
          breakevens.sort((a, b) => a - b);

          const combinedOi = (buyContract.oi || 0) + (sellContract.oi || 0);
          const combinedVolume = (buyContract.volume || 0) + (sellContract.volume || 0);

          list.push({
            id: `all-scan-${r.label}-${buyStrike}-${sellStrike}`,
            underlying: stock.symbol,
            expiry,
            optionType,
            direction: 'NORMAL',
            ratioStr: r.label,
            longQty: r.long,
            shortQty: r.short,
            buyStrike,
            sellStrike,
            actualGap,
            gapSteps: gSteps,
            lotSize: stock.lotSize,
            buyAsk,
            buyBid,
            buyAskQty: buyContract.askQty,
            buyBidQty: buyContract.bidQty,
            buyLtp: buyContract.ltp,
            sellBid,
            sellAsk,
            sellBidQty: sellContract.bidQty,
            sellAskQty: sellContract.askQty,
            sellLtp: sellContract.ltp,
            executableNetEntry: netEntry,
            executableTotalEntry: totalEntry,
            midNetEntry: null,
            conservativeLiquidation: null,
            slippageCost: 0,
            combinedSpreadCost: null,
            buySpread: null,
            buySpreadPct: null,
            sellSpread: null,
            sellSpreadPct: null,
            maxProfitPerShare,
            maxProfitPerLot,
            maxProfitAtSpot: null,
            maxLossPerShare,
            maxLossPerLot,
            isUnlimitedLoss,
            breakevens,
            breakevenDistPcts: breakevens.map(b =>
              Math.round(((b - currentSpot) / currentSpot) * 1000) / 10
            ),
            currentMtmPerShare: 0,
            currentMtmPerLot: 0,
            netDelta: (buyContract.delta || 0) * r.long - (sellContract.delta || 0) * r.short,
            netGamma: (buyContract.gamma || 0) * r.long - (sellContract.gamma || 0) * r.short,
            netVega: (buyContract.vega || 0) * r.long - (sellContract.vega || 0) * r.short,
            netTheta: (buyContract.theta || 0) * r.long - (sellContract.theta || 0) * r.short,
            lotDelta: ((buyContract.delta || 0) * r.long - (sellContract.delta || 0) * r.short) * stock.lotSize,
            lotTheta:
              ((buyContract.theta || 0) * r.long - (sellContract.theta || 0) * r.short) * stock.lotSize,
            buyIv: buyContract.iv || null,
            sellIv: sellContract.iv || null,
            buyOi: buyContract.oi || null,
            sellOi: sellContract.oi || null,
            buyOiChange: null,
            sellOiChange: null,
            buyVolume: buyContract.volume || null,
            sellVolume: sellContract.volume || null,
            combinedOi,
            combinedVolume,
            legs
          });
        }
      }
    }

    return list;
  }, [stock, expiry, optionType, contracts, allStrikes, currentSpot, sampleIndices, exchange]);

  const columns: ColumnsType<RatioStrategyRow> = [
    {
      title: 'Ratio',
      dataIndex: 'ratioStr',
      key: 'ratioStr',
      align: 'left',
      width: 80,
      render: text => (
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded font-bold font-mono border border-slate-200 dark:border-slate-700 whitespace-nowrap">
          {text}
        </span>
      ),
      sorter: (a, b) => a.ratioStr.localeCompare(b.ratioStr)
    },
    {
      title: 'Buy Strike',
      dataIndex: 'buyStrike',
      key: 'buyStrike',
      align: 'left',
      width: 100,
      render: val => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{val}</span>,
      sorter: (a, b) => a.buyStrike - b.buyStrike
    },
    {
      title: 'Sell Strike',
      dataIndex: 'sellStrike',
      key: 'sellStrike',
      align: 'left',
      width: 100,
      render: val => <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{val}</span>,
      sorter: (a, b) => a.sellStrike - b.sellStrike
    },
    {
      title: 'Actual Gap',
      key: 'actualGap',
      align: 'left',
      width: 120,
      render: (_, r) => (
        <span className="text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
          ₹{r.actualGap} ({r.gapSteps} steps)
        </span>
      ),
      sorter: (a, b) => a.actualGap - b.actualGap
    },
    {
      title: (
        <Tooltip title="Executable Net Entry per share. Positive = Debit, Negative = Credit">
          <span>Net Entry ℹ️</span>
        </Tooltip>
      ),
      dataIndex: 'executableNetEntry',
      key: 'executableNetEntry',
      align: 'right',
      width: 140,
      render: (val: number | null) => {
        if (val === null) return <Text type="secondary">-</Text>;
        const isCredit = val < 0;
        const isDebit = val > 0;
        return (
          <div className="font-mono tabular-nums whitespace-nowrap">
            <span className={`font-semibold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : isDebit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {isCredit ? '+' : isDebit ? '-' : ''}₹{Math.abs(val).toFixed(2)}
            </span>
            <Text type="secondary" className="text-[11px] ml-1">
              ({isCredit ? 'Credit' : 'Debit'})
            </Text>
          </div>
        );
      },
      sorter: (a, b) => (a.executableNetEntry ?? 0) - (b.executableNetEntry ?? 0)
    },
    {
      title: 'Max Profit',
      dataIndex: 'maxProfitPerShare',
      key: 'maxProfitPerShare',
      align: 'right',
      width: 130,
      render: (val: number | null, r) => {
        if (val === null) return <Text type="secondary">-</Text>;
        return (
          <div className="font-mono tabular-nums whitespace-nowrap">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              +₹{val.toFixed(2)}
            </span>
            <Text type="secondary" className="text-[11px] block">
              +₹{(r.maxProfitPerLot || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => (a.maxProfitPerShare ?? 0) - (b.maxProfitPerShare ?? 0)
    },
    {
      title: 'Max Loss',
      key: 'maxLoss',
      align: 'right',
      width: 120,
      render: (_, r) => {
        if (r.isUnlimitedLoss) {
          return (
            <Tag color="error" className="font-bold text-xs font-mono !mr-0 whitespace-nowrap">
              Unlimited ⚠️
            </Tag>
          );
        }
        if (r.maxLossPerShare !== null) {
          return (
            <span className="text-rose-600 dark:text-rose-400 font-medium tabular-nums font-mono whitespace-nowrap">
              -₹{Math.abs(Number(r.maxLossPerShare)).toFixed(2)}
            </span>
          );
        }
        return <span className="text-slate-400">-</span>;
      }
    },
    {
      title: 'Breakeven(s)',
      key: 'breakevens',
      align: 'center',
      width: 140,
      render: (_, r) => (
        <span className="text-slate-800 dark:text-slate-300 font-semibold tabular-nums font-mono whitespace-nowrap">
          {r.breakevens.length > 0 ? r.breakevens.map(b => `₹${Math.round(b)}`).join(', ') : '-'}
        </span>
      )
    },
    {
      title: 'Open Interest',
      dataIndex: 'combinedOi',
      key: 'combinedOi',
      align: 'right',
      width: 110,
      render: (val: number | null) => (
        <span className="tabular-nums font-mono">
          {val !== null ? val.toLocaleString('en-IN') : '-'}
        </span>
      ),
      sorter: (a, b) => (a.combinedOi ?? 0) - (b.combinedOi ?? 0)
    },
    {
      title: 'Volume',
      dataIndex: 'combinedVolume',
      key: 'combinedVolume',
      align: 'right',
      width: 100,
      render: (val: number | null) => (
        <span className="text-slate-500 dark:text-slate-400 tabular-nums font-mono">
          {val !== null ? val.toLocaleString('en-IN') : '-'}
        </span>
      ),
      sorter: (a, b) => (a.combinedVolume ?? 0) - (b.combinedVolume ?? 0)
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() => handleSelectRecord(record)}
          className="font-mono text-xs whitespace-nowrap px-3"
        >
          Payoff
        </Button>
      )
    }
  ];

  const handleSelectRecord = React.useCallback((record: RatioStrategyRow) => {
    if (record.legs && record.legs.length > 0) {
      const legConfigs = record.legs.map(l => ({
        side: l.side,
        optionType: l.optionType,
        strike: l.strike,
        quantity: l.quantity,
        price: l.executionPrice || 0
      }));
      const fullPayoff = evaluateStrategyPayoff(
        legConfigs,
        record.executableNetEntry || 0,
        currentSpot,
        stock.lotSize
      );
      onSelectStrategy({
        ...record,
        maxProfitPerShare: fullPayoff.maxProfitPerShare,
        maxProfitPerLot: fullPayoff.maxProfitPerLot,
        maxProfitAtSpot: fullPayoff.maxProfitAtSpot,
        maxLossPerShare: fullPayoff.maxLossPerShare,
        maxLossPerLot: fullPayoff.maxLossPerLot,
        isUnlimitedLoss: fullPayoff.isUnlimitedLoss,
        breakevens: fullPayoff.breakevens,
        breakevenDistPcts: fullPayoff.breakevenDistPcts
      });
    } else {
      onSelectStrategy(record);
    }
  }, [currentSpot, stock.lotSize, onSelectStrategy]);

  return (
    <div className="flex-1 overflow-x-auto bg-slate-50 dark:bg-slate-950 p-5 sm:p-7 space-y-6 font-sans text-xs transition-colors slim-scrollbar">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">
            <AppstoreOutlined />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-mono tracking-tight">
              All Ratios Strategy Comparative Matrix ({stock.symbol} {optionType})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cross-evaluating 1:1, 1:2, 1:3, 1:4, 2:3, 2:5, 3:5 ratio spread structures across ATM strikes
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Showing <strong className="text-slate-900 dark:text-white">{generatedRows.length}</strong> comparative structures
        </span>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table
          dataSource={generatedRows}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '84'],
            size: 'small',
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} structures`,
            className: '!px-4 !py-2.5'
          }}
          scroll={{ x: 1050 }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                description={
                  <span className="text-slate-500 text-xs font-sans">
                    No comparative ratio spread structures available for {stock.symbol}.
                  </span>
                }
              />
            )
          }}
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer"
          onRow={record => ({
            onClick: () => handleSelectRecord(record)
          })}
        />
      </div>
    </div>
  );
};
