import React, { useState, useMemo } from 'react';
import {
  UnderlyingStock,
  OptionType,
  DirectionMode,
  ReferenceStrikeMode,
  SavedPreset
} from '@/shared/types';
import { Select, Button, Tooltip, Popover, InputNumber, Flex, Tag, Typography, message, Segmented, Space } from 'antd';
import {
  ReloadOutlined,
  SaveOutlined,
  PlusOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FilterOutlined,
  SlidersOutlined,
  FileTextOutlined,
  NumberOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface StrategyControlBarProps {
  stock: UnderlyingStock;
  optionType: OptionType;
  onChangeOptionType: (type: OptionType) => void;
  direction: DirectionMode;
  onChangeDirection: (dir: DirectionMode) => void;
  ratioLong: number;
  ratioShort: number;
  onChangeRatio: (long: number, short: number) => void;
  gap: number;
  onChangeGap: (gap: number) => void;
  cnt: number;
  onChangeCnt: (cnt: number) => void;
  stk: string | number;
  onChangeStk: (stk: string | number) => void;
  minStrike: number | 'ALL';
  onChangeMinStrike: (min: number | 'ALL') => void;
  maxStrike: number | 'ALL';
  onChangeMaxStrike: (max: number | 'ALL') => void;
  allStrikes: number[];
  referenceMode: ReferenceStrikeMode;
  onChangeReferenceMode: (mode: ReferenceStrikeMode) => void;
  atmStrike: number;
  density: 'compact' | 'comfortable';
  onChangeDensity: (density: 'compact' | 'comfortable') => void;
  maxVisibleRows?: number | 'ALL';
  onChangeMaxVisibleRows?: (rows: number | 'ALL') => void;
  showAdvancedData: boolean;
  onToggleAdvancedData: () => void;
  onReset: () => void;
  onSavePreset: () => void;
  savedPresets: SavedPreset[];
  onLoadPreset: (preset: SavedPreset) => void;
}

export const StrategyControlBar: React.FC<StrategyControlBarProps> = ({
  stock,
  optionType,
  onChangeOptionType,
  direction,
  onChangeDirection,
  ratioLong,
  ratioShort,
  onChangeRatio,
  gap,
  onChangeGap,
  cnt,
  onChangeCnt,
  stk,
  onChangeStk,
  minStrike,
  onChangeMinStrike,
  maxStrike,
  onChangeMaxStrike,
  allStrikes,
  referenceMode,
  onChangeReferenceMode,
  atmStrike,
  density,
  onChangeDensity,
  maxVisibleRows = 'ALL',
  onChangeMaxVisibleRows,
  showAdvancedData,
  onToggleAdvancedData,
  onReset,
  onSavePreset,
  savedPresets: _savedPresets,
  onLoadPreset: _onLoadPreset
}) => {
  const [customRatioOpen, setCustomRatioOpen] = useState(false);
  const [customLong, setCustomLong] = useState<number | null>(ratioLong);
  const [customShort, setCustomShort] = useState<number | null>(ratioShort);

  const ratioOptions = [
    { long: 1, short: 1, label: '1:1' },
    { long: 1, short: 2, label: '1:2' },
    { long: 1, short: 3, label: '1:3' },
    { long: 2, short: 5, label: '2:5' },
    { long: 3, short: 5, label: '3:5' },
    { long: 1, short: 4, label: '1:4' },
    { long: 1, short: 5, label: '1:5' },
    { long: 1, short: 7, label: '1:7' }
  ];

  const actualStep = useMemo(() => {
    if (stk === 'AUTO') return stock.strikeStep;
    return typeof stk === 'number' ? stk : stock.strikeStep;
  }, [stk, stock.strikeStep]);

  const suggestedGaps = useMemo(() => {
    const base = actualStep;
    return [base, base * 2, base * 3, base * 4, base * 5, base * 6, base * 8, base * 10];
  }, [actualStep]);

  const generatedGaps = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= cnt; i++) {
      arr.push(gap * i);
    }
    return arr;
  }, [gap, cnt]);

  const isGapValid = gap % actualStep === 0;

  const handleApplyCustomRatio = () => {
    if (!customLong || !customShort || customLong <= 0 || customShort <= 0) {
      message.error('Please enter valid positive numbers for ratio legs');
      return;
    }
    onChangeRatio(customLong, customShort);
    setCustomRatioOpen(false);
  };

  const handleSaveClick = () => {
    onSavePreset();
    message.success(`Preset saved: ${ratioLong}:${ratioShort} ${optionType} ₹${gap} gap`);
  };

  const customRatioContent = (
    <div className="p-2 space-y-3 font-mono">
      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Set Custom Ratio (Buy : Sell)</div>
      <Flex align="center" gap={8}>
        <InputNumber
          min={1}
          max={20}
          value={customLong}
          onChange={val => setCustomLong(val)}
          style={{ width: 60 }}
          size="small"
        />
        <Text className="font-bold text-slate-400">:</Text>
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
          onClick={handleApplyCustomRatio}
          className="bg-blue-600 border-blue-600"
        >
          Apply
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-4 sm:gap-5 shadow-2xs font-sans text-slate-900 dark:text-slate-100">
      {/* 1. TOP ROW: RATIO QUICK BUTTONS & RESET/SAVE PRESET */}
      <div className="flex items-center justify-between flex-wrap gap-3 w-full">
        {/* Left: Ratio Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-sans shrink-0">
            RATIO
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {ratioOptions.map(r => {
              const isActive = ratioLong === r.long && ratioShort === r.short;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => onChangeRatio(r.long, r.short)}
                  className={`font-sans text-xs font-semibold px-2 sm:px-3 py-1 rounded-md transition-all border ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}

            <Popover
              content={customRatioContent}
              title={null}
              trigger="click"
              open={customRatioOpen}
              onOpenChange={setCustomRatioOpen}
            >
              <button
                type="button"
                className="font-sans text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-md transition-all border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 flex items-center gap-1"
              >
                <PlusOutlined className="text-[10px]" />
                <span>Custom</span>
              </button>
            </Popover>
          </div>
        </div>

        {/* Right: Reset & Save Preset Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="middle"
            icon={<ReloadOutlined />}
            onClick={onReset}
            className="dark:bg-slate-800 dark:border-slate-700 text-xs font-semibold px-3"
          >
            Reset
          </Button>

          <Button
            size="middle"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveClick}
            className="bg-blue-600 hover:bg-blue-500 border-blue-600 text-white text-xs font-semibold px-3.5 shadow-xs"
          >
            Save Preset
          </Button>
        </div>
      </div>

      {/* 2. PARAMETER MATRIX (4 Clean Cards in a Single Row) */}
      <div className="flex flex-nowrap items-stretch gap-2 w-full overflow-x-auto pb-0.5">
        {/* Card 1: TYPE & MODE */}
        <div className="flex-[1] min-w-[185px] rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:px-2.5 sm:py-2.5 shadow-2xs flex flex-col justify-center">
          <Flex align="center" gap={8} className="w-full">
            {/* TYPE (CE / PE) */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <ThunderboltOutlined className="text-slate-500" /> TYPE
              </span>
              <Segmented
                block
                value={optionType}
                onChange={val => onChangeOptionType(val as OptionType)}
                className={`type-segmented-control w-full ${
                  optionType === 'CE' ? 'segmented-ce' : 'segmented-pe'
                }`}
                options={[
                  {
                    label: (
                      <Space size={6} align="center">
                        <RiseOutlined />
                        <span>CE</span>
                      </Space>
                    ),
                    value: 'CE'
                  },
                  {
                    label: (
                      <Space size={6} align="center">
                        <FallOutlined />
                        <span>PE</span>
                      </Space>
                    ),
                    value: 'PE'
                  }
                ]}
              />
            </div>

            {/* MODE */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <SettingOutlined className="text-slate-500" /> MODE
              </span>
              <Select
                size="middle"
                value={direction}
                onChange={val => onChangeDirection(val)}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'NORMAL', value: 'NORMAL' },
                  { label: 'INVERTED', value: 'INVERTED' }
                ]}
              />
            </div>
          </Flex>
        </div>

        {/* Card 2: GAP, CNT, STK, REF */}
        <div className="flex-[1.8] min-w-[275px] rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:px-2.5 sm:py-2.5 shadow-2xs flex flex-col justify-center">
          <Flex align="center" gap={7} className="w-full">
            {/* GAP */}
            <div className="flex-1 min-w-[62px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <AppstoreOutlined className="text-slate-500" /> GAP
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={gap}
                onChange={val => onChangeGap(val)}
                options={suggestedGaps.map(g => ({ label: `₹${g}`, value: g }))}
                className="w-full font-sans text-xs"
              />
            </div>

            {/* CNT */}
            <div className="flex-1 min-w-[48px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <NumberOutlined className="text-slate-500" /> CNT
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={cnt}
                onChange={val => onChangeCnt(val)}
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(c => ({
                  label: `${c}`,
                  value: c
                }))}
                className="w-full font-sans text-xs"
              />
            </div>

            {/* STK */}
            <div className="flex-1 min-w-[58px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <BarChartOutlined className="text-slate-500" /> STK
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={stk}
                onChange={val => onChangeStk(val)}
                options={[
                  { label: `AUTO`, value: 'AUTO' },
                  ...[10, 20, 25, 50, 100, 250, 500].map(s => ({
                    label: `₹${s}`,
                    value: s
                  }))
                ]}
                className="w-full font-sans text-xs"
              />
            </div>

            {/* REF */}
            <div className="flex-1 min-w-[58px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <FileTextOutlined className="text-slate-500" /> REF
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={referenceMode}
                onChange={val => onChangeReferenceMode(val)}
                options={[
                  { label: `ATM`, value: 'ATM' },
                  { label: '+1 OTM', value: 'ATM_PLUS_1' },
                  { label: '-1 ITM', value: 'ATM_MINUS_1' },
                  { label: '+2 OTM', value: 'ATM_PLUS_2' },
                  { label: '-2 ITM', value: 'ATM_MINUS_2' }
                ]}
                className="w-full font-sans text-xs"
              />
            </div>
          </Flex>
        </div>

        {/* Card 3: MIN STRIKE & MAX STRIKE */}
        <div className="flex-[1] min-w-[175px] rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:px-2.5 sm:py-2.5 shadow-2xs flex flex-col justify-center">
          <Flex align="center" gap={7} className="w-full">
            {/* MIN STRIKE */}
            <div className="flex-1 min-w-[78px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <FilterOutlined className="text-slate-500" /> MIN STRIKE
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={minStrike}
                onChange={val => {
                  onChangeMinStrike(val);
                  if (val !== 'ALL' && maxStrike !== 'ALL' && typeof val === 'number' && typeof maxStrike === 'number' && val > maxStrike) {
                    onChangeMaxStrike('ALL');
                  }
                }}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'ALL', value: 'ALL' },
                  ...allStrikes.map(s => ({
                    label: `₹${s}`,
                    value: s
                  }))
                ]}
              />
            </div>

            {/* MAX STRIKE */}
            <div className="flex-1 min-w-[78px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <FilterOutlined className="text-slate-500" /> MAX STRIKE
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={maxStrike}
                onChange={val => {
                  onChangeMaxStrike(val);
                  if (val !== 'ALL' && minStrike !== 'ALL' && typeof val === 'number' && typeof minStrike === 'number' && val < minStrike) {
                    onChangeMinStrike('ALL');
                  }
                }}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'ALL', value: 'ALL' },
                  ...allStrikes.map(s => ({
                    label: `₹${s}`,
                    value: s
                  }))
                ]}
              />
            </div>
          </Flex>
        </div>

        {/* Card 4: DENSITY, ROWS & GREEKS */}
        <div className="flex-[1.5] min-w-[260px] rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:px-2.5 sm:py-2.5 shadow-2xs flex flex-col justify-center">
          <Flex align="center" gap={7} className="w-full">
            {/* DENSITY */}
            <div className="flex-1 min-w-[85px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <AppstoreOutlined className="text-slate-500" /> DENSITY
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={density}
                onChange={val => onChangeDensity(val)}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'Comfortable', value: 'comfortable' },
                  { label: 'Compact', value: 'compact' }
                ]}
              />
            </div>

            {/* ROWS */}
            <div className="flex-1 min-w-[60px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <UnorderedListOutlined className="text-slate-500" /> ROWS
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={maxVisibleRows}
                onChange={val => onChangeMaxVisibleRows && onChangeMaxVisibleRows(val)}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'ALL', value: 'ALL' },
                  { label: '10', value: 10 },
                  { label: '15', value: 15 },
                  { label: '20', value: 20 },
                  { label: '25', value: 25 },
                  { label: '30', value: 30 },
                  { label: '50', value: 50 },
                  { label: '100', value: 100 }
                ]}
              />
            </div>

            {/* GREEKS */}
            <div className="flex-1 min-w-[58px] flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans flex items-center gap-1 truncate">
                <SlidersOutlined className="text-slate-500" /> GREEKS
              </span>
              <Select
                size="middle"
                virtual={false}
                popupMatchSelectWidth={false}
                value={showAdvancedData ? 'ON' : 'OFF'}
                onChange={val => {
                  if ((val === 'ON' && !showAdvancedData) || (val === 'OFF' && showAdvancedData)) {
                    onToggleAdvancedData();
                  }
                }}
                className="w-full font-sans text-xs"
                options={[
                  { label: 'OFF', value: 'OFF' },
                  { label: 'ON', value: 'ON' }
                ]}
              />
            </div>
          </Flex>
        </div>
      </div>

      {/* 3. BOTTOM INFO SUBSTRIP */}
      <div className="flex items-center flex-wrap gap-4 text-xs font-sans pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Generated gaps:</span>
          <span className="font-mono font-extrabold text-slate-900 dark:text-white">
            {generatedGaps.join(' · ')}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Exchange step:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">₹{actualStep}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Reference:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">₹{atmStrike}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
          {isGapValid ? (
            <Tag className="m-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold font-sans text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
              <CheckOutlined className="text-emerald-600" />
              <span>Valid Steps</span>
            </Tag>
          ) : (
            <Tag className="m-0 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold font-sans text-[11px] px-2 py-0.5 rounded">
              Adjusted
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyControlBar;
