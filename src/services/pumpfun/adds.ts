import {  convertSolanaToTokenNoFee_Rust, convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";
import { convertSmallCountToLamport } from "@utils/premarket";
import BN from "bn.js";

export const DEFAULT_TOKEN_COUNT_DECIMAL = new BN("1000000000000000");

export function getPersentOfSuply(per: number): BN {
  return DEFAULT_TOKEN_COUNT_DECIMAL.muln(per).divn(100)
}

export function convertSolToPercentOnStart(sol: number): number {
  if (sol===0) {
    return 0
  }
  const solLamp = convertSmallCountToLamport(sol)
  const tokens = convertSolanaToTokenWithFee({input_sol_lamp:solLamp})

  const percent = (tokens.muln(100*1000)).div(DEFAULT_TOKEN_COUNT_DECIMAL).toNumber()/1000; // 1000 because of rounding for BN, and 0.001 is ok for precent
  return percent
}


export function convertSolToPercentOnStartNoFee(sol: number): number {
  if (sol===0) {
    return 0
  }
  const solLamp = convertSmallCountToLamport(sol)
  const tokens = convertSolanaToTokenNoFee_Rust({input_sol_lamp:solLamp})

  const percent = (tokens.muln(100*1000)).div(DEFAULT_TOKEN_COUNT_DECIMAL).toNumber()/1000; // 1000 because of rounding for BN, and 0.001 is ok for precent
  return percent
}
