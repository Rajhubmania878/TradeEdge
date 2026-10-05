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
    <thead className="shadow-xs z-20 sticky top-0">
      {/* Streamlined, Non-Nested Flat Table Header */}
      <tr className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-slate-700 font-sans text-xs h-11 backdrop-blur-md">
        {/* Frozen STRIKE Column */}
        <th className="sticky left-0 z-30 bg-slate-200 dark:bg-slate-900 px-3.5 py-2.5 text-center font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-r border-slate-300 dark:border-slate-700 min-w-[104px] whitespace-nowrap shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]">
          STRIKE
        </th>

        {/* Frozen LTP Column */}
        <th className="sticky left-[104px] z-30 bg-slate-200 dark:bg-slate-900 px-3.5 py-2.5 text-right font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-r-2 border-slate-400 dark:border-slate-600 min-w-[92px] whitespace-nowrap shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">
          LTP
        </th>

        {/* Gap Multiples Flat Columns */}
        {validatedGaps.map((gInfo) => (
          <React.Fragment key={`gap-${gInfo.target}`}>
            {/* BUY Column */}
            <th className="px-3 py-2 text-right font-bold border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 min-w-[110px]">
              <Tooltip title={`Strike Gap ₹${gInfo.actual} (${gInfo.steps} steps) · Net Entry for +${ratioLong} Long & -${ratioShort} Short`}>
                <div className="flex flex-col items-end cursor-help">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                    GAP {gInfo.actual}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    BUY (+{ratioLong})
                  </span>
                </div>
              </Tooltip>
            </th>

            {/* SELL Column */}
            <th className={`px-3 py-2 text-right font-bold whitespace-nowrap bg-rose-500/10 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 min-w-[110px] ${
              showAdvancedData
                ? 'border-r border-slate-300 dark:border-slate-800'
                : 'border-r-2 border-slate-400 dark:border-slate-600'
            }`}>
              <Tooltip title={`Strike Gap ₹${gInfo.actual} (${gInfo.steps} steps) · Sell Leg Bid Price`}>
                <div className="flex flex-col items-end cursor-help">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                    GAP {gInfo.actual}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-400 font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
                    SELL (-{ratioShort})
                  </span>
                </div>
              </Tooltip>
            </th>

            {showAdvancedData && (
              <>
                <th className="px-2 py-2 text-right font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-slate-100 dark:bg-slate-900 text-[10px]">
                  IV (B/S)
                </th>
                <th className="px-2 py-2 text-right font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-slate-100 dark:bg-slate-900 text-[10px]">
                  Δ Delta
                </th>
                <th className="px-2 py-2 text-right font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-800 whitespace-nowrap bg-slate-100 dark:bg-slate-900 text-[10px]">
                  OI
                </th>
                <th className="px-2 py-2 text-right font-bold text-slate-700 dark:text-slate-300 border-r-2 border-slate-400 dark:border-slate-600 whitespace-nowrap bg-slate-100 dark:bg-slate-900 text-[10px]">
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

export default GapStepHeader;
