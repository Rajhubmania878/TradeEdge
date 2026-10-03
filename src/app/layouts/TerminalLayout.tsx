import React from 'react';
import { TradeEdgeLogo } from '@/shared/components/branding/TradeEdgeLogo';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import {
  Space,
  Flex,
  Tag,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Tooltip,
  Select,
  Segmented
} from 'antd';
import type { MenuProps } from 'antd';
import {
  blue,
  purple,
  cyan,
  volcano,
  geekblue,
  gold,
  green
} from '@ant-design/colors';
import {
  UserOutlined,
  SettingOutlined,
  SafetyOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  TableOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RiseOutlined,
  AimOutlined,
  ApartmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { UnderlyingStock, Exchange, MarketFeedMetrics, UserProfile, StockMarketSummary } from '@/shared/types';
import { StockSelectorDropdown } from '@/shared/components/inputs/StockSelectorDropdown';
import { useTheme } from '@/store/ThemeContext';

export type MainTabType = 'MATRIX' | 'ALL_RATIOS' | 'OPTION_CHAIN' | 'SCANNER';

export interface TerminalLayoutProps {
  // Navigation & View Mode
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  exchange: Exchange;
  onSelectExchange: (exchange: Exchange) => void;

  // Selected Underlying Context
  selectedStock: UnderlyingStock;
  onSelectStock: (symbol: string) => void;
  selectedExpiry: string;
  onSelectExpiry: (exp: string) => void;

  // Real-time market feed & broker
  metrics: MarketFeedMetrics;
  summary: StockMarketSummary;
  onRefreshLive?: () => void;
  onOpenAngelModal: () => void;
  onOpenTestModal: () => void;

  // UI Modes
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;

  // Authentication & Profile
  currentUser?: UserProfile | null;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;

  // Children & Slots
  children: React.ReactNode;
  snapshotStrip?: React.ReactNode;
  statusBar?: React.ReactNode;
  stockSwitchToast?: React.ReactNode;
}

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  activeTab,
  setActiveTab,
  exchange,
  onSelectExchange,
  selectedStock,
  onSelectStock,
  selectedExpiry,
  onSelectExpiry,
  metrics,
  summary: _summary,
  onRefreshLive: _onRefreshLive,
  onOpenAngelModal,
  onOpenTestModal,
  isFocusMode,
  onToggleFocusMode,
  isFullscreen,
  onToggleFullscreen,
  currentUser,
  onOpenSettings,
  onOpenAdmin,
  onLogout,
  children,
  snapshotStrip,
  statusBar,
  stockSwitchToast
}) => {
  const { isDark, toggleTheme } = useTheme();
  const isAngelConnected = metrics.angelConnected;

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-header',
      type: 'group',
      label: (
        <Flex gap={12} align="center" className="py-1 px-1">
          <Avatar
            size="large"
            icon={<UserOutlined />}
            className="bg-slate-400 text-white font-bold shrink-0"
          >
            {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <div className="font-mono min-w-0">
            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {currentUser?.displayName || 'Angel Live'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {currentUser?.email || 'trader@tradeedge.pro'}
            </div>
          </div>
        </Flex>
      )
    },
    { type: 'divider' },
    {
      key: 'broker',
      label: (
        <Space size={8}>
          <Badge status={isAngelConnected ? 'success' : 'warning'} />
          <span className="font-mono text-xs">
            {isAngelConnected ? 'Angel One Active' : 'Connect SmartAPI'}
          </span>
        </Space>
      ),
      onClick: onOpenAngelModal
    },
    {
      key: 'tests',
      label: (
        <Space size={8}>
          <span className="font-mono text-xs">Engine 17-Point Verification</span>
        </Space>
      ),
      onClick: onOpenTestModal
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <span className="font-mono text-xs">Preferences & Config</span>,
      onClick: onOpenSettings
    },
    ...(currentUser?.role === 'ADMIN'
      ? [
          {
            key: 'admin',
            icon: <SafetyOutlined className="text-amber-500" />,
            label: <span className="font-mono text-xs text-amber-500 font-bold">Admin Console</span>,
            onClick: onOpenAdmin
          }
        ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-rose-500" />,
      label: (
        <span className="font-mono text-xs text-rose-500 font-bold">
          Log Out
        </span>
      ),
      onClick: onLogout
    }
  ];

  // Tab configuration dynamically reflecting current exchange (NSE / BSE) with semantic Ant Design color mapping
  const tabConfig = React.useMemo(() => [
    {
      key: 'MATRIX' as MainTabType,
      name: `${exchange} Ratio Matrix`,
      shortName: 'Ratio Matrix',
      icon: <TableOutlined className="text-sm shrink-0" />,
      desc: 'Quantitative Strike Spread Matrix',
      antdColor: blue[5] || '#1677ff',
      activeColorClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'ALL_RATIOS' as MainTabType,
      name: 'All Ratios',
      shortName: 'All Ratios',
      icon: <RiseOutlined className="text-sm shrink-0" />,
      desc: 'Cross-Ratio Comparative Multi-Spread View',
      antdColor: green[5] || '#52c41a',
      activeColorClass: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      key: 'OPTION_CHAIN' as MainTabType,
      name: 'Option Chain',
      shortName: 'Option Chain',
      icon: <ApartmentOutlined className="text-sm shrink-0" />,
      desc: 'Dual Call/Put Depth & Open Interest',
      antdColor: purple[5] || '#722ed1',
      activeColorClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'SCANNER' as MainTabType,
      name: 'Spreadsheet Scanner',
      shortName: 'Scanner',
      icon: <UnorderedListOutlined className="text-sm shrink-0" />,
      desc: 'Quantitative Strike Scanner & Filter Grid',
      antdColor: volcano[5] || '#fa541c',
      activeColorClass: 'text-orange-600 dark:text-orange-400'
    }
  ], [exchange]);

  // Route definition for ProLayout
  const proRoutes = React.useMemo(() => ({
    path: '/',
    routes: tabConfig.map(tab => ({
      path: tab.key,
      name: tab.name,
      icon: tab.icon
    }))
  }), [tabConfig]);

  return (
    <div
      className={`antd-pro-terminal-wrapper font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : 'min-h-screen'
      } bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col`}
    >
      <ProLayout
        title={false}
        logo={null}
        layout="top"
        navTheme={isDark ? 'realDark' : 'light'}
        splitMenus={false}
        contentWidth="Fluid"
        route={proRoutes}
        location={{ pathname: activeTab }}
        actionsRender={() => []}
        avatarProps={undefined}
        rightContentRender={false}
        collapsedButtonRender={false}
        isMobile={false}
        headerTitleRender={false}
        headerContentRender={(_props) => (
          <div className="flex flex-wrap items-center justify-between w-full min-w-0 py-1.5 sm:py-2 gap-2 sm:gap-2.5">
            {/* Row 1 / Left: Brand Logo & Title */}
            <div className="flex items-center gap-2 select-none shrink-0 order-1 py-0.5">
              <TradeEdgeLogo />
              <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white font-sans">
                TradeEdge
              </span>
            </div>

            {/* Row 1 / Right: Active Market Contract Selection & Global Utilities */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto order-2 xl:order-3 flex-wrap sm:flex-nowrap">
              {/* Active Market Contract Selection (Exchange, Stock, Expiry) */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
                {/* Exchange Dropdown */}
                <Select
                  size="middle"
                  value={exchange}
                  onChange={val => onSelectExchange(val as Exchange)}
                  options={[
                    { label: <span className="font-sans font-bold text-xs">NSE</span>, value: 'NSE' },
                    { label: <span className="font-sans font-bold text-xs">BSE</span>, value: 'BSE' }
                  ]}
                  className="font-sans text-xs shadow-2xs w-[68px]"
                />

                {/* Equity Selector */}
                <StockSelectorDropdown
                  selectedStock={selectedStock}
                  onSelectStock={onSelectStock}
                  exchange={exchange}
                />

                {/* Expiry Selector */}
                <Select
                  size="middle"
                  value={selectedExpiry}
                  onChange={val => onSelectExpiry(val)}
                  className="font-mono text-xs shadow-2xs w-[138px]"
                  options={selectedStock.expiries.map(exp => ({
                    label: (
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <CalendarOutlined className="text-slate-400" />
                        {exp}
                      </span>
                    ),
                    value: exp
                  }))}
                />
              </div>

              {/* Global Utilities */}
              <Flex align="center" gap={8} className="shrink-0 flex-nowrap">
                {/* Theme Toggle Icon Button */}
                <Tooltip title={isDark ? 'Light Theme' : 'Dark Theme'}>
                  <Button
                    size="middle"
                    icon={isDark ? <SunOutlined className="text-amber-400" /> : <MoonOutlined className="text-slate-600" />}
                    onClick={toggleTheme}
                    className="flex items-center justify-center dark:border-slate-700 dark:bg-slate-800"
                    aria-label="Toggle Theme"
                  />
                </Tooltip>

                {/* Focus Button - Expands width to display 'Exit Focus Mode' inline when active */}
                <Tooltip title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode (Grid Only)'}>
                  <Button
                    size="middle"
                    type={isFocusMode ? 'primary' : 'default'}
                    icon={<AimOutlined className={isFocusMode ? 'text-white' : 'text-slate-600 dark:text-slate-300'} />}
                    onClick={onToggleFocusMode}
                    className={`flex items-center justify-center transition-all duration-200 ${
                      isFocusMode
                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-600 text-white font-medium text-xs px-3 shadow-xs'
                        : 'dark:border-slate-700 dark:bg-slate-800'
                    }`}
                    aria-label={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                  >
                    {isFocusMode && (
                      <span className="font-sans font-medium text-xs tracking-tight whitespace-nowrap ml-1">
                        Exit Focus Mode
                      </span>
                    )}
                  </Button>
                </Tooltip>

                {/* Compact User Avatar Button */}
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                  <Tooltip title={`${currentUser?.displayName || 'System Admin'} (Account)`}>
                    <button
                      type="button"
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:ring-2 hover:ring-blue-500/30 transition-all shadow-2xs cursor-pointer"
                      aria-label="User Account Menu"
                    >
                      <Avatar
                        size={26}
                        className="bg-blue-600 text-white font-bold text-xs"
                      >
                        {currentUser?.displayName?.[0]?.toUpperCase() || 'S'}
                      </Avatar>
                    </button>
                  </Tooltip>
                </Dropdown>
              </Flex>
            </div>

            {/* Row 2 on Tablet/Mobile: Segmented Navigation Tabs */}
            <div className="w-full sm:w-auto order-3 xl:order-2 flex items-center pt-2 xl:pt-0 border-t border-slate-100 dark:border-slate-800/80 xl:border-t-0 xl:ml-4 xl:mr-auto shrink-0 overflow-x-auto no-scrollbar">
              <Segmented
                value={activeTab}
                onChange={val => setActiveTab(val as MainTabType)}
                options={tabConfig.map(tab => {
                  const isActive = activeTab === tab.key;
                  return {
                    value: tab.key,
                    icon: (
                      <span
                        className="inline-flex items-center justify-center transition-all duration-150"
                        style={{
                          color: tab.antdColor,
                          filter: isActive ? `drop-shadow(0 1px 2px ${tab.antdColor}60)` : undefined
                        }}
                      >
                        {tab.icon}
                      </span>
                    ),
                    label: (
                      <span
                        className={`font-semibold text-xs sm:text-[13px] tracking-tight select-none transition-colors duration-150 whitespace-nowrap ${
                          isActive
                            ? `${tab.activeColorClass} font-bold`
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="hidden sm:inline">{tab.name}</span>
                        <span className="inline sm:hidden">{tab.shortName || tab.name}</span>
                      </span>
                    )
                  };
                })}
                size="middle"
                className="bg-slate-100 dark:bg-slate-800/90 shadow-2xs font-sans shrink-0"
              />
            </div>
          </div>
        )}
        token={{
          header: {
            colorBgHeader: isDark ? '#0e1422' : '#ffffff',
            colorBgScrollHeader: isDark ? '#0e1422' : '#ffffff',
            colorHeaderTitle: isDark ? '#f9fafb' : '#0f172a',
            colorBgMenuItemHover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            colorBgMenuItemSelected: isDark ? '#1a2234' : '#e6f4ff',
            colorTextMenuSelected: isDark ? '#2563eb' : '#2563eb',
            heightLayoutHeader: 'auto' as any
          },
          pageContainer: {
            paddingInlinePageContainerContent: 12,
            paddingBlockPageContainerContent: 12,
            colorBgPageContainer: isDark ? '#0b0f19' : '#f8fafc'
          }
        }}
      >
        {/* Dynamic Stock Switch Toast Notification */}
        {stockSwitchToast && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-mono rounded-lg shadow-2xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{stockSwitchToast}</span>
          </div>
        )}

        {/* Page Container without redundant header, seamlessly embedding snapshotStrip */}
        {!isFocusMode ? (
          <PageContainer
            contentWidth="Fluid"
            pageHeaderRender={false}
            className="p-0"
          >
            {/* Direct Market Workspace - Zero Duplicates */}
            <div className="pro-terminal-content space-y-3 sm:space-y-4 pt-3 sm:pt-4 px-3 sm:px-6">
              {snapshotStrip}
              {children}
            </div>
          </PageContainer>
        ) : (
          <div className="p-2 space-y-2">
            {children}
          </div>
        )}
      </ProLayout>

      {/* Docked Status Bar */}
      {!isFocusMode && statusBar}
    </div>
  );
};

export default TerminalLayout;
