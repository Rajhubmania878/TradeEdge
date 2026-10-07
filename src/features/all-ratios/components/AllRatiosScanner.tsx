import React, { useMemo, useState } from 'react';
import {
  UnderlyingStock,
  OptionType,
  OptionContract,
  RatioStrategyRow,
  Exchange
} from '@/shared/types';
import { resolveTokenForExchange } from '@/data/universeManager';
import { evaluateStrategyPayoff } from '@/engine/payoffEngine';
import { Table, Tag, Tooltip, Empty, Typography, Space, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

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

const COMMON_RATIOS = [
  { long: 1, short: 1, label: '1:1' },
  { long: 1, short: 2, label: '1:2' },
  { long: 1, short: 3, label: '1:3' },
  { long: 1, short: 4, label: '1:4' },
  { long: 2, short: 3, label: '2:3' },
  { long: 2, short: 5, label: '2:5' },
  { long: 3, short: 5, label: '3:5' }
];

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const actualStep = stock.strikeStep;

  // Find ATM strike index
  const atmIdx = useMemo(() => {
    if (allStrikes.length === 0) return -1;
    let closestIdx = 0;
    let minDiff = Math.abs(currentSpot - allStrikes[0]);
    for (let i = 1; i < allStrikes.length; i++) {
      const diff = Math.abs(currentSpot - allStrikes[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return closestIdx;
  }, [allStrikes, currentSpot]);

  // Selected sample strikes around ATM (-4 to +6)
  const sampleIndices = useMemo(() => {
    if (atmIdx === -1) return [];
    const minI = Math.max(0, atmIdx - 4);
    const maxI = Math.min(allStrikes.length - 1, atmIdx + 6);
    const indices: number[] = [];
    for (let i = minI; i <= maxI; i++) {
      indices.push(i);
    }
    return indices;
  }, [atmIdx, allStrikes.length]);

  // Generate All Ratio strategy combinations across sample strikes and target gaps
  const generatedRows = useMemo(() => {
    const list: RatioStrategyRow[] = [];
    const gapMultipliers = [1, 2, 3, 4];

    for (const r of COMMON_RATIOS) {
      for (const i of sampleIndices) {
        const buyStrike = allStrikes[i];
        const buyToken = resolveTokenForExchange(stock.symbol, expiry, buyStrike, optionType, exchange);
        const buyContract = contracts.get(buyToken);
        if (!buyContract) continue;

        for (const gSteps of gapMultipliers) {
          const targetSellIdx = optionType === 'CE' ? i + gSteps : i - gSteps;
          if (targetSellIdx < 0 || targetSellIdx >= allStrikes.length) continue;

          const sellStrike = allStrikes[targetSellIdx];
          const actualGap = Math.abs(sellStrike - buyStrike);
          const sellToken = resolveTokenForExchange(stock.symbol, expiry, sellStrike, optionType, exchange);
          const sellContract = contracts.get(sellToken);
          if (!sellContract) continue;

          const buyAsk = buyContract.ask ?? buyContract.ltp ?? null;
          const buyBid = buyContract.bid ?? buyContract.ltp ?? null;
          const sellBid = sellContract.bid ?? sellContract.ltp ?? null;
          const sellAsk = sellContract.ask ?? sellContract.ltp ?? null;

          if (buyAsk === null || sellBid === null) continue;

          // Executable Net Entry = (LongQty × BuyAsk) - (ShortQty × SellBid)
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

          // Analytical Ratio Spread Math for Instant 60 FPS Table Updates
          const peakProfitPerShare = Math.round((r.long * actualGap - netEntry) * 100) / 100;
          const maxProfitPerShare = peakProfitPerShare;
          const maxProfitPerLot = Math.round(peakProfitPerShare * stock.lotSize * 100) / 100;

          const isCall = optionType === 'CE';
          const isUnlimitedLoss = isCall ? r.short > r.long : false;

          let maxLossPerShare: number | 'Unlimited' = isUnlimitedLoss ? 'Unlimited' : 0;
          let maxLossPerLot: number | 'Unlimited' = isUnlimitedLoss ? 'Unlimited' : 0;

          if (!isUnlimitedLoss) {
            const lossAtZero = !isCall ? (r.long * buyStrike - r.short * sellStrike) - netEntry : -netEntry;
            maxLossPerShare = Math.round(Math.min(lossAtZero, -netEntry) * 100) / 100;
            maxLossPerLot = Math.round(Number(maxLossPerShare) * stock.lotSize * 100) / 100;
          }

          const breakevens: number[] = [];
          if (netEntry > 0) {
            const beEntry = isCall ? buyStrike + netEntry / r.long : buyStrike - netEntry / r.long;
            breakevens.push(Math.round(beEntry * 10) / 10);
          }
          if (r.short > r.long && peakProfitPerShare > 0) {
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
      width: 85,
      render: text => (
        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-bold font-mono border border-blue-200 dark:border-blue-800 whitespace-nowrap">
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
      render: (val: number, r) => (
        <div className="font-mono tabular-nums text-right">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            +₹{val.toFixed(2)}
          </span>
          <span className="block text-[11px] text-slate-400">
            +₹{(val * r.lotSize).toLocaleString('en-IN')}
          </span>
        </div>
      ),
      sorter: (a, b) => a.maxProfitPerShare - b.maxProfitPerShare
    },
    {
      title: 'Max Loss',
      dataIndex: 'maxLossPerShare',
      key: 'maxLossPerShare',
      align: 'right',
      width: 120,
      render: (val: number | 'Unlimited') => {
        if (val === 'Unlimited') {
          return (
            <Tag color="error" className="font-mono font-bold text-[10px] m-0">
              UNLIMITED ⚠️
            </Tag>
          );
        }
        return (
          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            -₹{Math.abs(val).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Breakeven(s)',
      dataIndex: 'breakevens',
      key: 'breakevens',
      align: 'center',
      width: 130,
      render: (bes: number[]) => {
        if (bes.length === 0) return <Text type="secondary">-</Text>;
        return (
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs">
            {bes.map(b => `₹${Math.round(b)}`).join(', ')}
          </span>
        );
      }
    },
    {
      title: 'Open Interest',
      dataIndex: 'combinedOi',
      key: 'combinedOi',
      align: 'right',
      width: 120,
      render: (val: number) => (
        <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          {val.toLocaleString('en-IN')}
        </span>
      ),
      sorter: (a, b) => (a.combinedOi || 0) - (b.combinedOi || 0)
    },
    {
      title: 'Volume',
      dataIndex: 'combinedVolume',
      key: 'combinedVolume',
      align: 'right',
      width: 110,
      render: (val: number) => (
        <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          {val.toLocaleString('en-IN')}
        </span>
      ),
      sorter: (a, b) => (a.combinedVolume || 0) - (b.combinedVolume || 0)
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, r) => (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            handleSelectRecord(r);
          }}
          className="font-sans text-xs px-2.5 py-1 rounded bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors border border-blue-200 dark:border-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <EyeOutlined className="text-[11px]" />
          <span>Select</span>
        </button>
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
    <div className="w-full flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors">
      {/* PROFESSIONAL FLUSH HEADER BAR WITH CORNER-ATTACHED BADGE */}
      <div className="pl-0 pr-4 py-0 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors min-h-[44px]">
        <div className="flex items-stretch gap-3.5">
          {/* ATTACHED CORNER TAB BADGE */}
          {optionType === 'CE' ? (
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm uppercase px-4 py-2.5 rounded-tl-xl rounded-br-xl shadow-md flex items-center gap-2 tracking-wider shrink-0 select-none">
              <RiseOutlined className="text-base" />
              <span>CALLS (CE)</span>
            </div>
          ) : (
            <div className="bg-rose-600 dark:bg-rose-500 text-white font-extrabold text-xs sm:text-sm uppercase px-4 py-2.5 rounded-tl-xl rounded-br-xl shadow-md flex items-center gap-2 tracking-wider shrink-0 select-none">
              <FallOutlined className="text-base" />
              <span>PUTS (PE)</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap py-2">
            <Tag color="cyan" className="font-sans font-bold text-xs px-2.5 py-0.5 m-0 rounded-md border-0">
              {stock.symbol}
            </Tag>
            <Typography.Text strong className="font-sans text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              All Ratios Strategy Comparative Matrix
            </Typography.Text>
            <Tag className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 m-0 rounded-md">
              Expiry: {expiry}
            </Tag>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono py-2">
          Showing <strong className="text-slate-900 dark:text-white">{generatedRows.length}</strong> comparative structures
        </span>
      </div>

      {/* FLUSH FULL-WIDTH TABLE (NO NESTED CARD / NO EXTRA MARGINS) */}
      <div className="w-full overflow-x-auto border-b border-slate-200 dark:border-slate-800 slim-scrollbar">
        <Table
          dataSource={generatedRows}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: generatedRows.length,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '84'],
            size: 'small',
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} structures`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            },
            onShowSizeChange: (_current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            },
            locale: {
              items_per_page: '/ page'
            },
            className: '!px-4 !py-2.5 !m-0 !border-t !border-slate-200 dark:!border-slate-800'
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
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer font-mono text-xs"
          onRow={record => ({
            onClick: () => handleSelectRecord(record)
          })}
        />
      </div>
    </div>
  );
};

export default AllRatiosScanner;
