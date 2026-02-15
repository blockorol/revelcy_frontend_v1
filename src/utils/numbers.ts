import BN from "bn.js";

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

export function toDecString(x: BN | string | number | bigint): string {
  if (BN.isBN(x)) return (x as BN).toString(10);
  if (typeof x === "bigint") return x.toString(10);
  if (typeof x === "number") return Math.trunc(x).toString(10);
  if (typeof x === "string") {
    const s = x.trim();
    if (/^0x[0-9a-f]+$/i.test(s)) return new BN(s.slice(2), 16).toString(10);
    if (/^[0-9a-f]+$/i.test(s) && /[a-f]/i.test(s)) return new BN(s, 16).toString(10);
    if (/^\d+$/.test(s)) return s;
    throw new Error(`Invalid numeric string: "${x}"`);
  }
  throw new Error(`Unsupported type: ${typeof x}`);
}

export function ensureDec(name: string, v: string) {
  if (!/^\d+$/.test(v)) throw new Error(`${name} must be a decimal string, got "${v}"`);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Unit = "s" | "min" | "h" | "d" | "w" | "m";

export function convertSecondToNumber(numSecond: number): { amount: number; symbol: string } {
  const s = Math.max(0, Math.floor(numSecond)); // защита от отрицательных и дробных

  const units: Array<{ symbol: string; seconds: number }> = [
    { symbol: "month", seconds: 60 * 60 * 24 * 30 }, // условный месяц = 30 дней
    { symbol: "week", seconds: 60 * 60 * 24 * 7 },
    { symbol: "day", seconds: 60 * 60 * 24 },
    { symbol: "hour", seconds: 60 * 60 },
    { symbol: "minute", seconds: 60 },
    { symbol: "second", seconds: 1 },
  ];

  const unit = units.find(u => s >= u.seconds) ?? units[units.length - 1];
  const amount = s / unit.seconds;

  return { amount: amount, symbol: amount === 0 || amount === 1 ? unit.symbol : `${unit.symbol}s` };
}


export function convertNumberWithNull(num: number): { zeros: number; val: number } {
    if (num === 0) return { zeros: 0, val: 0 };
    
    // Use decimal string approach for more accurate counting
    const decimalStr = num.toString().split('.')[1] || '';
    const leadingZeros = decimalStr.match(/^0*/)?.[0].length || 0;
    const rest = decimalStr.slice(leadingZeros);
    
    // Limit val to maximum 2 decimal places
    const truncatedRest = rest.substring(0, 2);
    
    return { zeros: leadingZeros, val: parseInt(truncatedRest) };
}