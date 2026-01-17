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