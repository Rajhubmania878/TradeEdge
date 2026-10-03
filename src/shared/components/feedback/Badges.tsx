import React from 'react';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Tag, Badge } from 'antd';
import { cn } from '../../utils/cn';
import { formatRupee } from '../../utils/formatters';

interface CreditDebitBadgeProps {
  amount: number;
  lotSize?: number;
  className?: string;
}

/**
 * Standard Credit Badge component showing positive net entry
 */
export const CreditBadge: React.FC<CreditDebitBadgeProps> = ({
  amount,
  lotSize,
  className,
}) => {
  const absAmount = Math.abs(amount);
  const totalAmount = lotSize ? absAmount * lotSize : null;

  return (
    <div className={cn('inline-flex flex-col items-end whitespace-nowrap', className)}>
      <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm tabular-nums">
        <RiseOutlined className="text-xs" />
        <span>+{formatRupee(absAmount, 2, false)}</span>
        <Tag color="success" className="m-0 text-[11px] font-semibold px-1.5 py-0 border-0">
          Credit
        </Tag>
      </div>
      {totalAmount !== null && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums font-mono">
          Total: +{formatRupee(totalAmount, 2, false)} / lot
        </span>
      )}
    </div>
  );
};

/**
 * Standard Debit Badge component showing negative net entry / net debit
 */
export const DebitBadge: React.FC<CreditDebitBadgeProps> = ({
  amount,
  lotSize,
  className,
}) => {
  const absAmount = Math.abs(amount);
  const totalAmount = lotSize ? absAmount * lotSize : null;

  return (
    <div className={cn('inline-flex flex-col items-end whitespace-nowrap', className)}>
      <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs sm:text-sm tabular-nums">
        <FallOutlined className="text-xs" />
        <span>-{formatRupee(absAmount, 2, false)}</span>
        <Tag color="warning" className="m-0 text-[11px] font-semibold px-1.5 py-0 border-0">
          Debit
        </Tag>
      </div>
      {totalAmount !== null && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums font-mono">
          Total: -{formatRupee(totalAmount, 2, false)} / lot
        </span>
      )}
    </div>
  );
};

interface AtmBadgeProps {
  strike: number;
  isAtm: boolean;
  className?: string;
}

/**
 * Standard ATM Badge component for ATM strike highlighting
 */
export const AtmBadge: React.FC<AtmBadgeProps> = ({ strike, isAtm, className }) => {
  if (!isAtm) return null;

  return (
    <Tag
      color="warning"
      className={cn(
        'm-0 text-[11px] font-semibold font-mono px-1.5 py-0 border-0 whitespace-nowrap',
        className
      )}
    >
      ATM ({strike})
    </Tag>
  );
};

interface StatusBadgeProps {
  status: 'LIVE' | 'STALE' | 'DISCONNECTED' | 'RECONNECTING' | string;
  className?: string;
}

/**
 * Standard Live Feed Status Badge
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const isLive = status === 'LIVE';
  const isStale = status === 'STALE';
  const isDisconnected = status === 'DISCONNECTED';

  const badgeStatus = isLive ? 'processing' : isStale ? 'warning' : isDisconnected ? 'error' : 'default';
  const badgeColor = isLive ? '#10b981' : isStale ? '#f59e0b' : isDisconnected ? '#ef4444' : '#64748b';

  return (
    <div className={cn('inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold', className)}>
      <Badge status={badgeStatus} color={badgeColor} />
      <span className={isLive ? 'text-emerald-600 dark:text-emerald-400' : isStale ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}>
        {status}
      </span>
    </div>
  );
};
