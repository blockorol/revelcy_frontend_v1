
export function round(val: number, fractionDigits: number): number {
    return Number(val.toFixed(fractionDigits))
}

// Helper function to format number without trailing zeros (max 6 decimals)
export function formatNumberNoTrailingZeros(num: number): string {
  // Limit to 6 decimal places, then remove trailing zeros
  const str = num.toFixed(3);
  // Remove trailing zeros and decimal point if needed
  return str.replace(/\.?0+$/, '');
}