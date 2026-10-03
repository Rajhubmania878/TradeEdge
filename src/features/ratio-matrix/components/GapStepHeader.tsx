import React from 'react';
import { Tooltip, Tag } from 'antd';

interface ValidatedGapInfo {
  target: number;
  actual: number;
  isValid: boolean;
  steps: number;
}

interface GapStepHeaderProps {
  validatedGaps: ValidatedGapInfo[];
  effectiveStkStep: number;
  showAdvancedData: boolean;
  ratioLong: number;
  ratioShort: number;
}

export const GapStepHeader: React.FC<GapStepHeaderProps> = ({
  validatedGaps,
  effectiveStkStep,
  showAdvancedData,
  ratioLong,
  ratioShort
}) => {
  return (
    <thead>
      {/* LEVEL 1 HEADER: GAP COLUMNS (ANT DESIGN PRO TABLE STYLING) */}
      <tr className="bg-slate-100/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 font-sans text-xs h-11 backdrop-blur-xs shadow-2xs">
        {/* Frozen Left Columns: STRIKE & LTP with prominent freeze divider shadow */}
        <th className="sticky left-0 z-30 bg-slate-100/95 dark:bg-slate-900/95 px-3.5 py-2.5 text-center font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 min-w-[104px] whitespace-nowrap shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_4px_-1px_rgba(0,0,0,0.4)]">
          STRIKE
        </th>
        <th className="sticky left-[104px] z-30 bg-slate-100/95 dark:bg-slate-900/95 px-3.5 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-r-2 border-slate-300 dark:border-slate-700 min-w-[92px] whitespace-nowrap shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.6)]">
          LTP
        </th>

        {/* GAP Multiples Upper Headers with Distinct Group Boundaries */}
        {validatedGaps.map((gInfo, idx) => {
          const isEvenGroup = idx % 2 === 0;
          return (
            <th
              key={gInfo.target}
              colSpan={showAdvancedData ? 6 : 2}
              className={`px-3.5 py-2 text-center border-r-2 border-slate-300 dark:border-slate-700 whitespace-nowrap transition-colors ${
                isEvenGroup
                  ? 'bg-slate-50/90 dark:bg-slate-900/90'
                  : 'bg-slate-100/70 dark:bg-slate-800/40'
              }`}
            >
              <Tooltip title={`Strike Gap ₹${gInfo.actual} equals ${gInfo.steps} strike steps of ₹${effectiveStkStep}`}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 shadow-2xs cursor-help hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <span className="font-sans font-bold text-xs text-slate-800 dark:text-slate-100">
                    GAP {gInfo.actual}
                  </span>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    ({gInfo.steps} steps)
                  </span>
                </div>
              </Tooltip>
            </th>
          );
        })}
      </tr>

      {/* LEVEL 2 HEADER: BUY / SELL SUB-HEADERS */}
      <tr className="bg-slate-50/95 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b-2 border-slate-300 dark:border-slate-700 sticky top-[44px] z-20 font-sans text-[11px] uppercase tracking-wider h-9 backdrop-blur-xs">
        <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-center font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_4px_-1px_rgba(0,0,0,0.4)]">
          (Strike)
        </th>
        <th className="sticky left-[104px] z-30 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-right font-semibold text-slate-500 dark:text-slate-400 border-r-2 border-slate-300 dark:border-slate-700 whitespace-nowrap shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.6)]">
          (Spot/LTP)
        </th>

        {validatedGaps.map((gInfo) => (
          <React.Fragment key={`sub-${gInfo.target}`}>
            {/* BUY Column Header with Green Tint */}
            <th className="px-2.5 py-1.5 text-right font-bold border-r border-slate-200/90 dark:border-slate-800/90 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/30">
              <Tooltip title={`Net Executable Entry for +${ratioLong} Long & -${ratioShort} Short`}>
                <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                  BUY (+{ratioLong})
                </span>
              </Tooltip>
            </th>

            {/* SELL Column Header with Rose Tint & Distinct Right Boundary Divider */}
            <th className={`px-2.5 py-1.5 text-right font-bold whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/30 ${
              showAdvancedData
                ? 'border-r border-slate-200 dark:border-slate-800'
                : 'border-r-2 border-slate-300 dark:border-slate-700'
            }`}>
              <Tooltip title={`Sell Leg Bid Price at target gap strike`}>
                <span className="inline-flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
                  SELL (-{ratioShort})
                </span>
              </Tooltip>
            </th>

            {showAdvancedData && (
              <>
                <th className="px-2 py-1.5 text-right font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap bg-slate-50 dark:bg-slate-900/60">
                  IV (B/S)
                </th>
                <th className="px-2 py-1.5 text-right font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap bg-slate-50 dark:bg-slate-900/60">
                  Δ Delta
                </th>
                <th className="px-2 py-1.5 text-right font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap bg-slate-50 dark:bg-slate-900/60">
                  OI
                </th>
                <th className="px-2 py-1.5 text-right font-medium text-slate-500 dark:text-slate-400 border-r-2 border-slate-300 dark:border-slate-700 whitespace-nowrap bg-slate-50 dark:bg-slate-900/60">
                  Volume
                </th>
              </>
            )}
          </React.Fragment>
        ))}
      </tr>
    </thead>
  );
};
