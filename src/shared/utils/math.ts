/**
 * Rounds a number to a specific decimal precision
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculates percentage distance between two price values
 * e.g., spot = 1000, strike = 1050 -> 5.0%
 */
export function getPercentageDistance(target: number, reference: number): number {
  if (reference === 0) return 0;
  return ((target - reference) / reference) * 100;
}

/**
 * Clamps a number between a minimum and maximum value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
