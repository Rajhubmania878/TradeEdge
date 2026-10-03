import React from 'react';
import { ScannerFilterConfig, SortField, SortDirection } from '@/shared/types';
import { Select, Segmented, Button, Tooltip, Space, Flex, Divider, Typography } from 'antd';
import {
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface FilterToolbarProps {
  filter: ScannerFilterConfig;
  onChangeFilter: (f: ScannerFilterConfig) => void;
  sortField: SortField;
  onChangeSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  onToggleSortDirection: () => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filter,
  onChangeFilter,
  sortField,
  onChangeSortField,
  sortDirection,
  onToggleSortDirection,
  totalCount,
  filteredCount
}) => {
  const resetFilters = () => {
    onChangeFilter({
      netType: 'ALL',
      minOi: 0,
      minVolume: 0,
      maxSpreadPct: 10,
      minMaxProfit: 0,
      minDelta: -1,
      maxDelta: 1,
      searchQuery: ''
    });
  };

  const hasActiveFilters =
    filter.netType !== 'ALL' || filter.minOi > 0 || filter.maxSpreadPct < 10;

  return (
    <div className="px-6 sm:px-8 py-3.5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-sans transition-colors">
      <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
        {/* Left: Quick Filters with Ant Design Segmented & Selects */}
        <Space size={16} align="center" wrap>
          <Segmented
            value={filter.netType}
            onChange={val => onChangeFilter({ ...filter, netType: val as any })}
            options={[
              { label: <span className="px-2 font-medium">All Spreads</span>, value: 'ALL' },
              {
                label: (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold px-2">Net Credit</span>
                ),
                value: 'CREDIT_ONLY'
              },
              {
                label: (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold px-2">Net Debit</span>
                ),
                value: 'DEBIT_ONLY'
              }
            ]}
            size="middle"
            className="shadow-2xs"
          />

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-6 my-auto hidden sm:inline-block" />

          {/* Max Spread % Liquidity Filter */}
          <Space size={8} align="center">
            <Text type="secondary" className="text-xs font-semibold uppercase font-mono">Max Spread:</Text>
            <Select
              size="middle"
              value={filter.maxSpreadPct}
              onChange={val => onChangeFilter({ ...filter, maxSpreadPct: val })}
              style={{ width: 155 }}
              options={[
                { value: 2, label: '< 2% (Tightest)' },
                { value: 4, label: '< 4% (Good)' },
                { value: 10, label: '< 10% (Normal)' },
                { value: 50, label: 'Any Spread' }
              ]}
              className="shadow-2xs"
            />
          </Space>

          {/* Min OI Filter */}
          <Space size={8} align="center">
            <Text type="secondary" className="text-xs font-semibold uppercase font-mono">Min OI:</Text>
            <Select
              size="middle"
              value={filter.minOi}
              onChange={val => onChangeFilter({ ...filter, minOi: val })}
              style={{ width: 125 }}
              options={[
                { value: 0, label: 'All OI' },
                { value: 10000, label: '> 10k' },
                { value: 50000, label: '> 50k' },
                { value: 100000, label: '> 100k' }
              ]}
              className="shadow-2xs"
            />
          </Space>

          {/* Reset button */}
          {hasActiveFilters && (
            <Tooltip title="Reset filters to default">
              <Button
                size="middle"
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                className="text-xs px-3"
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Space>

        {/* Right: Sort & Count with Ant Design Select & Button */}
        <Space size={14} align="center">
          <Text type="secondary" className="text-xs font-mono">
            Showing <Text strong className="text-slate-900 dark:text-white">{filteredCount}</Text> of {totalCount} structures
          </Text>

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-5 my-auto" />

          {/* Sort Field & Direction */}
          <Space size={8} align="center">
            <Text type="secondary" className="text-xs font-semibold uppercase font-mono">Sort:</Text>
            <Select
              size="middle"
              value={sortField}
              onChange={val => onChangeSortField(val as SortField)}
              style={{ width: 195 }}
              options={[
                { value: 'netEntry', label: 'Net Entry (Credit first)' },
                { value: 'maxProfit', label: 'Max Profit' },
                { value: 'spreadCost', label: 'Lowest Bid-Ask Spread %' },
                { value: 'combinedOi', label: 'Highest Open Interest' },
                { value: 'combinedVolume', label: 'Highest Volume' },
                { value: 'netTheta', label: 'Highest Theta Decay' },
                { value: 'buyStrike', label: 'Buy Strike' }
              ]}
              className="shadow-2xs"
            />

            <Tooltip title={`Toggle sort order (${sortDirection})`}>
              <Button
                size="middle"
                icon={
                  sortDirection === 'ASC' ? (
                    <ArrowUpOutlined className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowDownOutlined className="text-emerald-600 dark:text-emerald-400" />
                  )
                }
                onClick={onToggleSortDirection}
                className="px-3"
              />
            </Tooltip>
          </Space>
        </Space>
      </Flex>
    </div>
  );
};
