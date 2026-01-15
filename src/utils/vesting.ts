import { toNumberSafe } from "@utils/numbers";
import BN from "bn.js";
import { convertDecimalToToken } from "@utils/premarket"; 

export type VestingVM = {
  totalAmount: number;
  vestedAmount: number;
  claimedAmount: number;
  vestedPct: number;   // vested/total
  claimedPct: number;  // claimed/total
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function toVestingVMFromDec(opts: {
  totalDec: string;
  vestedDec?: string;
  claimedDec?: string;
}): VestingVM {
  const total = convertDecimalToToken(new BN(opts.totalDec ?? "0"));
  const vested = convertDecimalToToken(new BN(opts.vestedDec ?? "0"));
  const claimed = convertDecimalToToken(new BN(opts.claimedDec ?? "0"));

  const t = Math.max(0, total);
  const v = clamp(Math.max(0, vested), 0, t);
  const c = clamp(Math.max(0, claimed), 0, v);

  const vestedPct = t > 0 ? (v / t) * 100 : 0;
  const claimedPct = t > 0 ? (c / t) * 100 : 0;

  return {
    totalAmount: t,
    vestedAmount: v,
    claimedAmount: c,
    vestedPct: clamp(vestedPct, 0, 100),
    claimedPct: clamp(claimedPct, 0, 100),
  };
}
