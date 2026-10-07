import React from 'react';
import { ArrowLeftOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useTheme } from '@/store/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  onNavigateHome?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onNavigateHome }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:py-16 font-sans selection:bg-blue-500/30 transition-colors">
      {/* Top Left Corner Back Navigation Button */}
      {onNavigateHome && (
        <button
          type="button"
          onClick={onNavigateHome}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400/60 shadow-xs text-xs font-semibold font-sans transition-all cursor-pointer group"
          aria-label="Go Back"
        >
          <ArrowLeftOutlined className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xs transition-colors" />
          <span className="font-semibold">Back</span>
        </button>
      )}

      {/* Top Right Corner Theme Toggle Button */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30">
        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <Button
            size="middle"
            icon={isDark ? <SunOutlined className="text-amber-400" /> : <MoonOutlined className="text-slate-600 dark:text-slate-300" />}
            onClick={toggleTheme}
            className="flex items-center justify-center font-medium border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
          />
        </Tooltip>
      </div>

      {children}
    </div>
  );
};
