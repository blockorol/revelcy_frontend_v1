import { BN } from "@coral-xyz/anchor";
import { DEFAULT_TOKEN_COUNT_DECIMAL } from "@services/pumpfun/adds";

export const LAMPORT_MULTIPLIER=1_000_000_000;
export const LAMPORT_MULTIPLIER_BIG_INT=new BN(LAMPORT_MULTIPLIER);


export function convertTokenToDecimal(value: number | BN): BN {
  if (BN.isBN(value)) {
    return DEFAULT_TOKEN_COUNT_DECIMAL.mul(value);
  }

  const parts = value.toFixed(6).split(".");
  const whole = parts[0];
  const frac = (parts[1] || "").padEnd(6, "0");
  const asBN = new BN(`${whole}${frac}`);
  return asBN;
}

export function convertDecimalToToken(value: BN): number {
  const decimalStr = value.toString();
  const whole = decimalStr.slice(0, -6) || "0";
  const fraction = decimalStr.slice(-6).padStart(6, '0');

  return parseFloat(`${whole}.${fraction}`);
}

export function convertLamportToSmallCount(lamportAmount: BN): number {
  const lamportsStr = lamportAmount.toString();
  const whole = lamportsStr.slice(0, -9) || "0";
  const fraction = lamportsStr.slice(-9).padStart(9, '0');

  return parseFloat(`${whole}.${fraction}`);
}

export function convertSmallCountToLamport(n: number): BN {
  const parts = n.toFixed(9).split('.'); // e.g., "123.456000000" -> ["123", "456000000"]
  const whole = parts[0];
  const decimal = parts[1].padEnd(9, '0'); // should be 9 digits

  const combined = `${whole}${decimal}`; // "123456000000"
  return new BN(combined);
}

export function convertCountToLamport(n: number): BN {
  const parts = n.toFixed(9).split('.'); // e.g., "123.456000000" -> ["123", "456000000"]
  const whole = parts[0];
  const decimal = parts[1].padEnd(9, '0'); // should be 9 dig

  const combined = `${whole}${decimal}`; // "123456000000"
  return new BN(combined);
}



export function formatNumberCompact(value: number | bigint | BN): string {
  let num: number;

  if (BN.isBN(value)) {
    try {
      num = value.toNumber();
    } catch {
      return value.toString(); // for `${value.div(new BN(1_000_000)).toString()} M`
    }
  } else if (typeof value === 'bigint') {
    try {
      num = Number(value);
    } catch {
      return value.toString(); // same
    }
  } else {
    num = value;
  }

  if (isNaN(num)) return 'NaN';

  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    if (billions >= 100) {
      return `${Math.round(billions)}B`;
    } else if (billions >= 10) {
      return `${billions.toFixed(1)}B`;
    } else {
      return `${billions.toFixed(2)}B`;
    }
  } else if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    if (millions >= 100) {
      return `${Math.round(millions)}M`;
    } else if (millions >= 10) {
      return `${millions.toFixed(1)}M`;
    } else {
      return `${millions.toFixed(2)}M`;
    }
  } else if (num >= 1_000) {
    const thousands = num / 1_000;
    if (thousands >= 100) {
      return `${Math.round(thousands)}k`;
    } else if (thousands >= 10) {
      return `${thousands.toFixed(1)}k`;
    } else {
      return `${thousands.toFixed(2)}k`;
    }
  } else {
    return `${Math.round(num)}`;
  }
}



export function getTimeLeftLabel(timestamp: number): string {
  const now = Date.now();
  const target = timestamp > 1e12 ? timestamp : timestamp * 1000; // handle seconds or ms
  const diff = target - now;

  if (diff <= 0) return 'Expired';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months >= 1) return `${months}mo`;
  if (days >= 1) return `${days}d`;
  if (hours >= 1) return `${hours}h`;
  if (minutes >= 1) return `${minutes}m`;
  return `${seconds}s`;
}


export function convertTimeStampToDataMonth(timestamp: number): string {
  if (timestamp < 1e12) {
    timestamp *= 1000;
  }

  const date = new Date(timestamp);
  const day = date.getDate();
  const monthShort = date.toLocaleString('en-US', { month: 'short' }); // "Jan", "Feb", etc.

  return `${day} ${monthShort}`;
}

export type PremarketState = 'premarket' | 'canceled' | 'finished' | 'times_up' | 'expired';
