import { BN } from "@coral-xyz/anchor";

export const LAMPORT_MULTIPLIER=1_000_000_000;
export const LAMPORT_MULTIPLIER_BIG_INT=new BN(LAMPORT_MULTIPLIER);

const TOKEN_MULTIPLIER=1_000_000;
const TOKEN_MULTIPLIER_BIG_INT=new BN(TOKEN_MULTIPLIER);

export const DEFAULT_TOKEN_COUNT=1_000_000_000;
export const DEFAULT_TOKEN_COUNT_DECIMAL=TOKEN_MULTIPLIER_BIG_INT.mul(new BN(DEFAULT_TOKEN_COUNT));

export const virtualSupplyRatioLamp = new BN(30_000_000_000)
export const virtualTokenRatioDecim = new BN(1_073_000_191_000_000).sub(DEFAULT_TOKEN_COUNT_DECIMAL)


export function getPersentOfPremartet(per: number): BN {
  return DEFAULT_TOKEN_COUNT_DECIMAL.muln(per).divn(100)
}
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

export function convertSolToPercentOnStart(sol: number): number {
  const solLamp = convertCountToLamport(sol)
  const tokenDec = convertSolanaToTokenBuy({
    sol_amount: solLamp,
    reserves_sol: new BN(0),
    reserves_token: DEFAULT_TOKEN_COUNT_DECIMAL
  })
  return (convertDecimalToToken(tokenDec)/DEFAULT_TOKEN_COUNT)*100

}

// Returns count tokens (in lamport) for Sol amount
export function convertSolanaToTokenBuy(
  args: {
    sol_amount: BN,    // amount SOL (in lamport) to convert to token
    reserves_sol: BN,  // amount SOL reserved in account
    reserves_token: BN // amount Token reserved in account
  }
): BN {  
    const solToCalc = args.reserves_sol.add(virtualSupplyRatioLamp)
    const tokenToCalc = args.reserves_token.add(virtualTokenRatioDecim)
    return tokenToCalc.mul(args.sol_amount).div(args.sol_amount.add(solToCalc))
}

export function convertTokenToSolanaBuy(
  args: {
    token_amount: BN,  // amount Tokens (in lamport) to convert to SOL
    reserves_sol: BN,  // amount SOL reserved in account
    reserves_token: BN // amount Token reserved in account
  }
): BN {
  if (args.token_amount.gt(args.reserves_token)) {
    throw new Error("tokenIn must be less than virtualTokenReserves");
  }

  const solToCalc = args.reserves_sol.add(virtualSupplyRatioLamp)
  const tokenToCalc = args.reserves_token.add(virtualTokenRatioDecim)
  return solToCalc.mul(args.token_amount).div(args.token_amount.sub(tokenToCalc))
}

// Returns count SOL (in lamport) for token amount
export function convertTokenToSolanaSell(
  args: {
    token_amount: BN,  // amount Tokens (in lamport) to convert to SOL
    reserves_sol: BN,  // amount SOL reserved in account
    reserves_token: BN // amount Token reserved in account
  }
): BN {
  if (args.token_amount.gt(args.reserves_token)) {
    throw new Error("tokenIn must be less than virtualTokenReserves");
  }

  const solToCalc = args.reserves_sol.add(virtualSupplyRatioLamp)
  const tokenToCalc = args.reserves_token.add(virtualTokenRatioDecim)
  return solToCalc.mul(args.token_amount).div(args.token_amount.add(tokenToCalc))
  // return args.reserves_sol.mul(args.token_amount).div(args.reserves_token.add(args.token_amount));
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
    return `${Math.round(num / 1_000_000_000)} B`;
  } else if (num >= 1_000_000) {
    return `${Math.round(num / 1_000_000)} M`;
  } else if (num >= 1_000) {
    return `${Math.round(num / 1_000)} K`;
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

export type PremarketState = 'premarket' | 'canceled' | 'finished';
