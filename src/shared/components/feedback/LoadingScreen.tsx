import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { TradeEdgeLogo } from '@/shared/components/branding/TradeEdgeLogo';

export interface LoadingScreenProps {
  /** Mode of presentation */
  mode?: 'fullscreen' | 'page' | 'panel';
  /** Primary status headline */
  title?: string;
  /** Detailed status message */
  tip?: string;
  /** Optional custom class */
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  mode = 'page',
  title = 'TradeEdge',
  tip = 'Loading workspace...',
  className = ''
}) => {
  const antIcon = (
    <LoadingOutlined
      className="text-blue-600 dark:text-blue-500"
      style={{ fontSize: 28 }}
      spin
    />
  );

  // Panel / Sub-view compact loader for tabs and inline widgets
  if (mode === 'panel') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 min-h-[200px] w-full text-center font-sans antialiased ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="h-8 w-8 flex items-center justify-center">
          <Spin indicator={antIcon} />
        </div>
        {tip && (
          <p className="mt-3 font-sans text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 tracking-tight h-5 line-clamp-1 m-0 p-0">
            {tip}
          </p>
        )}
      </div>
    );
  }

  // Fullscreen or Full-page clean loader
  const containerClasses = mode === 'fullscreen'
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-[#0b0f19]/95 backdrop-blur-xs'
    : 'min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19]';

  return (
    <div
      className={`${containerClasses} font-sans antialiased transition-colors duration-150 select-none m-0 p-0 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* 
        Strict 176px tall centered content box preventing any vertical layout shift:
        - Logo: 40px + 16px margin = 56px
        - Title: 28px + 20px margin = 48px
        - Spinner: 32px + 16px margin = 48px
        - Status Text: 24px height = 24px
        Total: exactly 176px across all loading states & pre-mount HTML
      */}
      <div className="flex flex-col items-center text-center w-full max-w-md h-[176px] m-0 p-0">
        {/* Geometric Brand Logo: exactly 40px height + 16px bottom margin */}
        <div className="h-10 w-10 mb-4 flex items-center justify-center shrink-0">
          <TradeEdgeLogo size={40} />
        </div>

        {/* Brand Name: exactly 28px line-height + 20px bottom margin */}
        <div className="h-7 leading-7 mb-5 shrink-0 select-none">
          <span className="font-sans font-bold text-[20px] tracking-[-0.03em] text-slate-900 dark:text-white">
            {title === 'TradeEdge' ? (
              <>
                Trade<span className="text-blue-600 dark:text-blue-500 font-extrabold">Edge</span>
              </>
            ) : (
              title
            )}
          </span>
        </div>

        {/* Ant Design Spinner: exactly 32px height + 16px bottom margin */}
        <div className="h-8 w-8 mb-4 flex items-center justify-center shrink-0">
          <Spin indicator={antIcon} />
        </div>

        {/* Status Tip: exactly 24px height, single-line ellipsis to prevent height delta shift */}
        <div className="h-6 leading-6 flex items-center justify-center shrink-0 max-w-[90vw] overflow-hidden">
          <p className="font-sans text-[13px] font-medium text-slate-500 dark:text-slate-400 tracking-[-0.01em] whitespace-nowrap truncate m-0 p-0">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
