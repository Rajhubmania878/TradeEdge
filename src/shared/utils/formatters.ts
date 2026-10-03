/**
 * Indian Rupee Formatter using standard Indian numbering format (Lakhs/Crores)
 * e.g., 150000 -> "₹1,50,000.00" or custom decimals
 */
export function formatRupee(
  value: number | null | undefined,
  decimals: number = 2,
  showSign: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const roundedValue = Number(value.toFixed(decimals));
  const absoluteValue = Math.abs(roundedValue);

  // Fallback if Intl is not fully configured, or custom formatting
  let formatted = '';
  try {
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(absoluteValue);
  } catch {
    formatted = absoluteValue.toFixed(decimals);
  }

  const sign = roundedValue < 0 ? '-' : showSign ? '+' : '';
  return `${sign}₹${formatted}`;
}

/**
 * Format standard numeric percentages
 * e.g., 12.34 -> "12.34%"
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2,
  showSign: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const roundedValue = Number(value.toFixed(decimals));
  const absoluteValue = Math.abs(roundedValue);
  const sign = roundedValue < 0 ? '-' : showSign ? '+' : '';

  return `${sign}${absoluteValue.toFixed(decimals)}%`;
}

/**
 * Format option Greeks with specific decimal precision
 * e.g., -0.2345 -> "-0.235"
 */
export function formatGreeks(
  value: number | null | undefined,
  decimals: number = 3,
  showSign: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const roundedValue = Number(value.toFixed(decimals));
  const absoluteValue = Math.abs(roundedValue);
  const sign = roundedValue < 0 ? '-' : showSign ? '+' : '';

  return `${sign}${absoluteValue.toFixed(decimals)}`;
}

/**
 * Format big integer volumes / Open Interest values (e.g. 1.2M, 450K)
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absVal >= 10000000) {
    return `${sign}${(absVal / 10000000).toFixed(2)}Cr`;
  }
  if (absVal >= 100000) {
    return `${sign}${(absVal / 100000).toFixed(2)}L`;
  }
  if (absVal >= 1000) {
    return `${sign}${(absVal / 1000).toFixed(1)}K`;
  }

  return `${sign}${absVal.toString()}`;
}
