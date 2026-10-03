import React from 'react';
import { UnderlyingStock, Exchange, MarketFeedMetrics, UserProfile } from '@/shared/types';
import { StockSelectorDropdown } from '@/shared/components/inputs/StockSelectorDropdown';
import {
  Layout,
  Segmented,
  Select,
  Button,
  Dropdown,
  Badge,
  Tooltip,
  Space,
  Flex,
  Divider,
  Avatar,
  Tag,
  Typography
} from 'antd';
import type { MenuProps } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  UserOutlined,
  SettingOutlined,
  SafetyOutlined,
  LogoutOutlined,
  DownOutlined,
  SunOutlined,
  MoonOutlined,
  TableOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  ThunderboltOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useTheme } from '@/store/ThemeContext';

export type MainTabType = 'MATRIX' | 'SCANNER' | 'OPTION_CHAIN' | 'ALL_RATIOS';

interface HeaderBarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  metrics: MarketFeedMetrics;
  exchange: Exchange;
  onSelectExchange: (exchange: Exchange) => void;
  onOpenAngelModal: () => void;
  onOpenTestModal: () => void;
  onToggleStreaming: () => void;
  isStreaming: boolean;
  selectedStock: UnderlyingStock;
  onSelectStock: (symbol: string) => void;
  selectedExpiry: string;
  onSelectExpiry: (exp: string) => void;
  ratioLong: number;
  ratioShort: number;
  onSelectRatio: (long: number, short: number) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  currentUser?: UserProfile | null;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  exchange,
  onSelectExchange,
  onOpenAngelModal,
  onOpenTestModal,
  selectedStock,
  onSelectStock,
  selectedExpiry,
  onSelectExpiry,
  isFocusMode = false,
  onToggleFocusMode,
  isFullscreen = false,
  onToggleFullscreen,
  currentUser,
  onOpenSettings,
  onOpenAdmin,
  onLogout
}) => {
  const { isDark, toggleTheme } = useTheme();
  const isAngelConnected = metrics.angelConnected;

  const tabOptions = [
    {
      label: (
        <Space size={6} align="center">
          <TableOutlined className="text-emerald-500" />
          <span>{exchange} Ratio Matrix</span>
        </Space>
      ),
      value: 'MATRIX'
    },
    {
      label: (
        <Space size={6} align="center">
          <AppstoreOutlined className="text-sky-500" />
          <span>All Ratios</span>
        </Space>
      ),
      value: 'ALL_RATIOS'
    },
    {
      label: (
        <Space size={6} align="center">
          <LineChartOutlined className="text-purple-500" />
          <span>Option Chain</span>
        </Space>
      ),
      value: 'OPTION_CHAIN'
    },
    {
      label: (
        <Space size={6} align="center">
          <UnorderedListOutlined className="text-amber-500" />
          <span>Spreadsheet Scanner</span>
        </Space>
      ),
      value: 'SCANNER'
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-header',
      type: 'group',
      label: (
        <Flex gap={12} align="center" className="py-1 px-1">
          <Avatar
            size="large"
            icon={<UserOutlined />}
            className="bg-emerald-600 text-white font-bold shrink-0"
          >
            {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <div className="font-mono min-w-0">
            <Typography.Text strong className="text-slate-900 dark:text-white text-xs block truncate">
              {currentUser?.displayName || 'Trader'}
            </Typography.Text>
            <Typography.Text type="secondary" className="text-[11px] block truncate">
              {currentUser?.email}
            </Typography.Text>
            {currentUser?.role === 'ADMIN' && (
              <Tag color="gold" className="mt-1 text-[11px] font-semibold py-0 px-1 border-0">
                ADMINISTRATOR
              </Tag>
            )}
          </div>
        </Flex>
      )
    },
    {
      type: 'divider'
    },
    {
      key: 'settings',
      icon: <SettingOutlined className="text-slate-500" />,
      label: <span className="font-sans text-xs font-medium">Account Settings</span>,
      onClick: onOpenSettings
    },
    ...(currentUser?.role === 'ADMIN'
      ? [
          {
            key: 'admin',
            icon: <SafetyOutlined className="text-amber-500" />,
            label: (
              <span className="font-sans text-xs font-medium text-amber-600 dark:text-amber-400">
                Admin Control Panel
              </span>
            ),
            onClick: onOpenAdmin
          }
        ]
      : []),
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-rose-500" />,
      label: (
        <span className="font-sans text-xs font-medium text-rose-600 dark:text-rose-400">
          Log Out
        </span>
      ),
      onClick: onLogout
    }
  ];

  return (
    <Layout.Header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[100] h-14 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors leading-none">
      <Flex align="center" justify="space-between" className="w-full max-w-[1920px] mx-auto gap-4">
        {/* Zone 1: Logo & Primary Navigation Tabs */}
        <Flex align="center" gap={16} className="shrink-0">
          <Space size={10} align="center">
            <Badge status="processing" color="#2f54eb" />
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Typography.Text strong className="text-sm tracking-tight text-slate-900 dark:text-white font-mono uppercase">
                RATIO SPREAD
              </Typography.Text>
              <Tag color="geekblue" className="m-0 font-mono text-[11px] font-semibold px-1.5 py-0 border-0 uppercase">
                PRO
              </Tag>
            </a>
          </Space>

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-5 my-auto hidden md:inline-block" />

          {/* Primary Navigation Tabs */}
          {!isFocusMode && (
            <div className="hidden lg:block">
              <Segmented
                value={activeTab}
                onChange={val => setActiveTab(val as MainTabType)}
                options={tabOptions}
                size="middle"
                className="bg-slate-100 dark:bg-slate-800/80 p-0.5"
              />
            </div>
          )}
        </Flex>

        {/* Zone 2: Right Control Clusters */}
        <Flex align="center" gap={12} className="shrink-0">
          {/* Subgroup A: Asset Context (Exchange + Equity + Expiry) */}
          <Space size={8} align="center">
            <Segmented
              value={exchange}
              onChange={val => onSelectExchange(val as Exchange)}
              options={[
                { label: <span className="font-mono font-bold text-xs">NSE</span>, value: 'NSE' },
                { label: <span className="font-mono font-bold text-xs">BSE</span>, value: 'BSE' }
              ]}
              size="small"
              className="bg-slate-100 dark:bg-slate-800"
            />

            <StockSelectorDropdown
              selectedStock={selectedStock}
              onSelectStock={onSelectStock}
              exchange={exchange}
            />

            <Select
              size="small"
              value={selectedExpiry}
              onChange={val => onSelectExpiry(val)}
              style={{ width: 135 }}
              options={selectedStock.expiries.map(exp => ({ label: exp, value: exp }))}
              className="font-mono text-xs"
            />
          </Space>

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-5 my-auto hidden sm:inline-block" />

          {/* Subgroup B: Terminal Utilities (Theme + Focus Mode + Fullscreen + Tests) */}
          <Space size={6} align="center">
            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <Button
                size="small"
                icon={isDark ? <SunOutlined className="text-amber-400" /> : <MoonOutlined className="text-slate-600 dark:text-slate-300" />}
                onClick={toggleTheme}
                className="flex items-center justify-center font-medium border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
            </Tooltip>

            {onToggleFocusMode && (
              <Tooltip title={isFocusMode ? 'Exit Focus Mode' : 'Enter Terminal Focus'}>
                <Button
                  size="small"
                  type={isFocusMode ? 'primary' : 'default'}
                  icon={<EyeOutlined />}
                  onClick={onToggleFocusMode}
                  className={isFocusMode ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'dark:border-slate-700 dark:bg-slate-800'}
                >
                  <span className="hidden xl:inline">{isFocusMode ? 'Focused' : 'Focus'}</span>
                </Button>
              </Tooltip>
            )}

            {onToggleFullscreen && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <Button
                  size="small"
                  type={isFullscreen ? 'primary' : 'default'}
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={onToggleFullscreen}
                  className={isFullscreen ? 'bg-emerald-600 border-emerald-600 text-white' : 'dark:border-slate-700 dark:bg-slate-800'}
                />
              </Tooltip>
            )}

            {onOpenTestModal && (
              <Tooltip title="Run System Verification & Payoff Engine Tests">
                <Button
                  size="small"
                  icon={<CodeOutlined className="text-sky-500" />}
                  onClick={onOpenTestModal}
                  className="dark:border-slate-700 dark:bg-slate-800"
                />
              </Tooltip>
            )}
          </Space>

          <Divider vertical className="bg-slate-200 dark:bg-slate-800 h-5 my-auto" />

          {/* Subgroup C: Broker Integration & Authenticated User Profile */}
          <Space size={8} align="center">
            <Tooltip title={isAngelConnected ? 'Angel One SmartAPI Live Streaming Active' : 'Configure Angel One Credentials'}>
              <Button
                size="small"
                icon={<ThunderboltOutlined className={isAngelConnected ? 'text-emerald-500' : 'text-amber-500'} />}
                onClick={onOpenAngelModal}
                className="font-mono text-xs flex items-center gap-1.5 dark:border-slate-700 dark:bg-slate-800"
              >
                <Badge status={isAngelConnected ? 'success' : 'warning'} className="shrink-0" />
                <span className="hidden sm:inline font-semibold">{isAngelConnected ? 'Angel Live' : 'SmartAPI'}</span>
              </Button>
            </Tooltip>

            {currentUser && (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <Button
                  size="small"
                  className="font-mono text-xs font-bold flex items-center gap-2 pl-1.5 pr-2.5 h-8 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                >
                  <Avatar
                    size={20}
                    icon={<UserOutlined />}
                    className="bg-emerald-600 text-white text-[10px] font-bold shrink-0"
                  >
                    {currentUser.displayName?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase()}
                  </Avatar>
                  <span className="max-w-[100px] truncate hidden sm:inline text-slate-800 dark:text-slate-200">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                  {currentUser.role === 'ADMIN' && (
                    <Tag color="gold" className="m-0 text-[11px] font-semibold px-1.5 py-0 border-0">
                      ADM
                    </Tag>
                  )}
                  <DownOutlined className="text-[10px] text-slate-400" />
                </Button>
              </Dropdown>
            )}
          </Space>
        </Flex>
      </Flex>
    </Layout.Header>
  );
};

export default HeaderBar;

