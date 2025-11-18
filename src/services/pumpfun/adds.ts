import { convertSolanaToTokenNoFee, convertTokenToSolNoFee } from "@services/pumpfun/convertors";
import { getTotalSuply } from "@services/pumpfun/pumpGlobalCache";
import { convertSmallCountToLamport } from "@utils/premarket";
import BN from "bn.js";

export function getPersentOfSuply(per: number): BN {
  return getTotalSuply().muln(per).divn(100)
}

export function getPersentOfSuplyWithSol(per: number): {token_dec: BN, solana_lamp: BN} {
  const token_dec =  getTotalSuply().muln(per).divn(100)
  const solana_lamp = convertTokenToSolNoFee({input_token_dec:token_dec})
  return {
    token_dec: token_dec,
    solana_lamp: solana_lamp,
  }
}

export function convertSolToPercentOnStart(sol: number): number {
  if (sol===0) {
    return 0
  }
  const solLamp = convertSmallCountToLamport(sol)
  const tokens = convertSolanaToTokenNoFee({input_sol_lamp:solLamp})
  const percent = (tokens.muln(100)).div(getTotalSuply()).toNumber()
  console.log("", 
    {
      sol: sol, 
      solLamp: solLamp.toString(), 
      tokens: tokens.toString(), 
      supply: getTotalSuply().toString(),
      percent: percent,
    }
  )
  return percent
}