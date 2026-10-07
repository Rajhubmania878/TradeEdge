import React, { useState } from 'react';
import {
  UnderlyingStock,
  OptionType,
  GapMode,
  DirectionMode,
  ReferenceStrikeMode
} from '@/shared/types';
import { ProCard } from '@ant-design/pro-components';
import { StockSelectorDropdown } from '@/shared/components/inputs/StockSelectorDropdown';
import { Select, Segmented, Button, Tooltip, Popover, InputNumber, Space, Flex, Divider } from 'antd';
import { SwapOutlined, PlusOutlined } from '@ant-design/icons';


interface ControlsPanelProps {
  selectedStock: UnderlyingStock;
  onSelectStock: (symbol: string) => void;
  selectedExpiry: string;
  onSelectExpiry: (expiry: string) => void;
  optionType: OptionType;
  onChangeOptionType: (type: OptionType) => void;
  direction: DirectionMode;
  onChangeDirection: (dir: DirectionMode) => void;
  ratioLong: number;
  ratioShort: number;
  onChangeRatio: (long: number, short: number) => void;
  gapMode: GapMode;
  onChangeGapMode: (mode: GapMode) => void;
  gapSteps: number;
  onChangeGapSteps: (steps: number) => void;
  targetPriceGap: number;
  onChangeTargetPriceGap: (gap: number) => void;
  strikeRange: number;
  onChangeStrikeRange: (range: number) => void;
  referenceMode: ReferenceStrikeMode;
  onChangeReferenceMode: (mode: ReferenceStrikeMode) => void;
  atmStrike: number;
  pricingMode: 'EXECUTABLE' | 'MID' | 'CONSERVATIVE';
  onChangePricingMode: (mode: 'EXECUTABLE' | 'MID' | 'CONSERVATIVE') => void;
  availableStrikesCount: { below: number; above: number };
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  selectedStock,
  onSelectStock,
  selectedExpiry,
  onSelectExpiry,
  optionType,
  onChangeOptionType,
  direction,
  onChangeDirection,
  ratioLong,
  ratioShort,
  onChangeRatio,
  gapMode,
  onChangeGapMode,
  gapSteps,
  onChangeGapSteps,
  targetPriceGap,
  onChangeTargetPriceGap,
  strikeRange,
  onChangeStrikeRange,
  pricingMode,
  onChangePricingMode,
  availableStrikesCount
}) => {
  const [customRatioOpen, setCustomRatioOpen] = useState(false);
  const [customLong, setCustomLong] = useState<number | null>(ratioLong);
  const [customShort, setCustomShort] = useState<number | null>(ratioShort);

  const ratioPresets = [
    { long: 1, short: 1, label: '1:1' },
    { long: 1, short: 2, label: '1:2' },
    { long: 1, short: 3, label: '1:3' },
    { long: 1, short: 4, label: '1:4' },
    { long: 2, short: 3, label: '2:3' },
    { long: 2, short: 5, label: '2:5' },
    { long: 3, short: 5, label: '3:5' }
  ];

  // Quick tickers
  const popularTickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'ADANIENT', 'MARUTI', 'LT'];

  const customRatioPopover = (
    <div className="p-2 space-y-2 font-sans">
      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Custom Long : Short Ratio</div>
      <Space size={8} align="center">
        <InputNumber
          min={1}
          max={20}
          value={customLong}
          onChange={val => setCustomLong(val)}
          style={{ width: 60 }}
          size="small"
        />
        <span className="font-bold text-slate-400">:</span>
        <InputNumber
          min={1}
          max={20}
          value={customShort}
          onChange={val => setCustomShort(val)}
          style={{ width: 60 }}
          size="small"
        />
        <Button
          type="primary"
          size="small"
          onClick={() => {
            if (customLong && customShort && customLong > 0 && customShort > 0) {
              onChangeRatio(customLong, customShort);
              setCustomRatioOpen(false);
            }
          }}
        >
          Set
        </Button>
      </Space>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-4 sm:gap-5 mb-4 shadow-2xs font-sans text-slate-900 dark:text-slate-100">
      {/* Top Row: Asset Context & Quick Watchlist */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 w-full">
        {/* Prominent Searchable Stock Selector */}
        <Space size={10} align="center" wrap>
          <StockSelectorDropdown
            selectedStock={selectedStock}
            onSelectStock={onSelectStock}
          />
        </Space>

        {/* Quick Tickers */}
        <Space size={8} align="center" className="hidden lg:flex" wrap>
          <span className="text-xs font-bold text-slate-500 uppercase font-mono">Quick:</span>
          {popularTickers.map(ticker => (
            <Button
              key={ticker}
              size="middle"
              type={ticker === selectedStock.symbol ? 'primary' : 'default'}
              onClick={() => onSelectStock(ticker)}
              className={`font-mono text-xs font-bold px-3 ${
                ticker === selectedStock.symbol
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              {ticker}
            </Button>
          ))}
        </Space>

        {/* Expiry & Pricing View Mode Cluster */}
        <Space size={14} align="center" wrap>
          <Space size={8} align="center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expiry:</span>
            <Select
              size="middle"
              value={selectedExpiry}
              onChange={val => onSelectExpiry(val)}
              className="font-mono text-xs shadow-2xs w-[130px] sm:w-[155px]"
              options={selectedStock.expiries.map(exp => ({ label: exp, value: exp }))}
            />
          </Space>

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-5 my-auto hidden sm:inline-block" />

          <Space size={8} align="center">
            <span className="text-xs text-slate-500 font-bold uppercase font-mono hidden xs:inline">Price:</span>
            <Segmented
              size="middle"
              value={pricingMode}
              onChange={val => onChangePricingMode(val as any)}
              options={[
                { label: 'Executable', value: 'EXECUTABLE' },
                { label: 'Mid', value: 'MID' },
                { label: 'Conservative', value: 'CONSERVATIVE' }
              ]}
              className="shadow-2xs text-xs"
            />
          </Space>
        </Space>
      </div>

      {/* Main Parameters Row: CE/PE, Ratio, Gap Mode, Strike Steps, Range */}
      <ProCard ghost gutter={[12, 12]} wrap className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
        {/* 1. Option Type & Direction */}
        <ProCard colSpan={{ xs: 24, md: 12, xl: 6 }} bordered size="small" className="rounded-xl shadow-2xs dark:bg-slate-950/60" bodyStyle={{ padding: '12px 14px' }}>
          <Flex align="center" justify="space-between" gap={10} className="w-full">
            <Segmented
              block
              value={optionType}
              onChange={val => onChangeOptionType(val as OptionType)}
              options={[
                {
                  label: (
                    <span className={`font-bold font-mono transition-colors text-xs ${
                      optionType === 'CE'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      CALL (CE)
                    </span>
                  ),
                  value: 'CE'
                },
                {
                  label: (
                    <span className={`font-bold font-mono transition-colors text-xs ${
                      optionType === 'PE'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      PUT (PE)
                    </span>
                  ),
                  value: 'PE'
                }
              ]}
              size="middle"
              className="flex-1 shadow-2xs"
            />

            <Tooltip
              title={
                optionType === 'CE'
                  ? direction === 'NORMAL'
                    ? 'Standard Call Ratio: Long Lower Strike, Short Higher Strike'
                    : 'Reverse Call Ratio: Short Lower Strike, Long Higher Strike'
                  : direction === 'NORMAL'
                  ? 'Standard Put Ratio: Long Higher Strike, Short Lower Strike'
                  : 'Reverse Put Ratio: Short Higher Strike, Long Lower Strike'
              }
            >
              <Button
                size="middle"
                icon={<SwapOutlined />}
                onClick={() => onChangeDirection(direction === 'NORMAL' ? 'REVERSE' : 'NORMAL')}
                className={direction === 'NORMAL' ? 'px-2.5 sm:px-3.5 text-xs' : 'text-amber-500 border-amber-500/60 px-2.5 sm:px-3.5 text-xs'}
              >
                <span className="hidden sm:inline">{direction === 'NORMAL' ? 'Standard' : 'Reverse'}</span>
              </Button>
            </Tooltip>
          </Flex>
        </ProCard>

        {/* 2. Custom Ratio Controller */}
        <ProCard colSpan={{ xs: 24, md: 12, xl: 6 }} bordered size="small" className="rounded-xl shadow-2xs dark:bg-slate-950/60" bodyStyle={{ padding: '12px 14px' }}>
          <Flex align="center" gap={10} className="w-full overflow-x-auto no-scrollbar">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase shrink-0 font-mono">Ratio:</span>
            <Space size={6} align="center" className="overflow-x-auto no-scrollbar flex-nowrap">
              {ratioPresets.map(p => {
                const isActive = ratioLong === p.long && ratioShort === p.short && !customRatioOpen;
                return (
                  <Button
                    key={p.label}
                    size="middle"
                    type={isActive ? 'primary' : 'default'}
                    onClick={() => {
                      onChangeRatio(p.long, p.short);
                      setCustomRatioOpen(false);
                    }}
                    className={`font-mono text-xs px-2.5 sm:px-3 font-semibold ${
                      isActive ? 'bg-emerald-600 border-emerald-600 text-white' : ''
                    }`}
                  >
                    {p.label}
                  </Button>
                );
              })}

              <Popover
                content={customRatioPopover}
                trigger="click"
                open={customRatioOpen}
                onOpenChange={setCustomRatioOpen}
              >
                <Button
                  size="middle"
                  icon={<PlusOutlined />}
                  className="text-xs text-slate-500 dark:text-slate-400 px-2.5"
                >
                  Custom
                </Button>
              </Popover>
            </Space>
          </Flex>
        </ProCard>

        {/* 3. Gap Controls (Exchange Strikes vs Rupee Target) */}
        <ProCard colSpan={{ xs: 24, md: 12, xl: 6 }} bordered size="small" className="rounded-xl shadow-2xs dark:bg-slate-950/60" bodyStyle={{ padding: '12px 14px' }}>
          <Flex align="center" gap={10} className="w-full overflow-x-auto no-scrollbar">
            <Segmented
              size="middle"
              value={gapMode}
              onChange={val => onChangeGapMode(val as GapMode)}
              options={[
                { label: 'Steps', value: 'STRIKE_STEPS' },
                { label: '₹ Gap', value: 'PRICE_GAP' }
              ]}
              className="shrink-0"
            />

            {gapMode === 'STRIKE_STEPS' ? (
              <Space size={6} align="center" className="font-mono overflow-x-auto no-scrollbar flex-nowrap">
                {[1, 2, 3, 4, 5].map(step => (
                  <Button
                    key={step}
                    size="middle"
                    type={gapSteps === step ? 'primary' : 'default'}
                    onClick={() => onChangeGapSteps(step)}
                    className={`px-2.5 sm:px-3 font-bold text-xs ${
                      gapSteps === step ? 'bg-emerald-600 border-emerald-600 text-white' : ''
                    }`}
                  >
                    {step}
                  </Button>
                ))}
              </Space>
            ) : (
              <Space size={6} align="center" className="font-mono overflow-x-auto no-scrollbar flex-nowrap">
                {[20, 50, 100, 200].map(gap => (
                  <Button
                    key={gap}
                    size="middle"
                    type={targetPriceGap === gap ? 'primary' : 'default'}
                    onClick={() => onChangeTargetPriceGap(gap)}
                    className={`px-2 sm:px-2.5 font-bold text-xs ${
                      targetPriceGap === gap ? 'bg-emerald-600 border-emerald-600 text-white' : ''
                    }`}
                  >
                    ₹{gap}
                  </Button>
                ))}
              </Space>
            )}
          </Flex>
        </ProCard>

        {/* 4. Strike Range (±5, ±10, ±15, ±20) */}
        <ProCard colSpan={{ xs: 24, md: 12, xl: 6 }} bordered size="small" className="rounded-xl shadow-2xs dark:bg-slate-950/60" bodyStyle={{ padding: '12px 14px' }}>
          <Flex align="center" justify="space-between" gap={10} className="w-full overflow-x-auto no-scrollbar">
            <Space size={8} align="center" className="shrink-0">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase font-mono">Range:</span>
              <Space size={4} align="center" className="font-mono flex-nowrap">
                {[5, 10, 15, 20].map(r => (
                  <Button
                    key={r}
                    size="middle"
                    type={strikeRange === r ? 'primary' : 'default'}
                    onClick={() => onChangeStrikeRange(r)}
                    className={`px-2 sm:px-3 font-bold text-xs ${
                      strikeRange === r ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    ±{r}
                  </Button>
                ))}
              </Space>
            </Space>

            <div className="text-xs text-slate-500 font-mono text-right shrink-0">
              <span>{availableStrikesCount.below}↓/{availableStrikesCount.above}↑</span>
            </div>
          </Flex>
        </ProCard>
      </ProCard>
    </div>
  );
};
