
export function round(val: number, fractionDigits: number): number {
    return Number(val.toFixed(fractionDigits))
}

// Helper function to format number without trailing zeros (max 6 decimals)
export function formatNumberNoTrailingZeros(num: number): string {
  // Limit to 6 decimal places, then remove trailing zeros
  const str = num.toFixed(6);
  // Remove trailing zeros and decimal point if needed
  return str.replace(/\.?0+$/, '');
}

export function toNumberSafe(v: unknown, fallback = 0): number {
  if (v == null) return fallback;

  if (typeof v === "number") {
    return Number.isFinite(v) ? v : fallback;
  }

  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  const n = Number(v as any);
  return Number.isFinite(n) ? n : fallback;
}

