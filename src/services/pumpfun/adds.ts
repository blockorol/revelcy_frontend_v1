import {  convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";
import { getTotalSuply } from "@services/pumpfun/pumpGlobalCache";
import { convertSmallCountToLamport } from "@utils/premarket";
import BN from "bn.js";

const TOTAL = new BN("1000000000000000")

export function getPersentOfSuply(per: number): BN {
  return TOTAL.muln(per).divn(100)
}

export function convertSolToPercentOnStart(sol: number): number {
  if (sol===0) {
    return 0
  }
  const solLamp = convertSmallCountToLamport(sol)
  const tokens = convertSolanaToTokenWithFee({input_sol_lamp:solLamp})

  const percent = (tokens.muln(100)).div(TOTAL).toNumber()
    console.log("tokens", {
    tokens: tokens.toString(),
    solLamp: solLamp.toString(),
    percent: percent
  })
  return percent
}