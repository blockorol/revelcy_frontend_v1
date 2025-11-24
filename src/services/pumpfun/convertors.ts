import BN from "bn.js";
import { tokensOutFromSol_FROM_OUR_CONTRACT } from "@services/pumpfun/copyPastedMethods";

export function convertSolanaToTokenNoFee_Rust(params: {
  input_sol_lamp: BN; // amount SOL (in lamport) to convert to token
  before_sol_lamp?: BN; // amount SOL reserved in account
}, settings?:
    {
      vS0: string,
      vT0: string
    }): BN {
  const vS0 = new BN(settings?.vS0 ??'8000000000') // todo: double checl looks like wrong value should be 30*
  const vT0 = new BN(settings?.vT0 ??'1073000000000000');

  if (params.before_sol_lamp === undefined) {
    return tokensOutFromSol_FROM_OUR_CONTRACT(
      params.input_sol_lamp, 
      vS0,
      vT0
  )}

  const vtrBefore =  tokensOutFromSol_FROM_OUR_CONTRACT(
    params.before_sol_lamp, 
    vS0,
    vT0
  )

  return tokensOutFromSol_FROM_OUR_CONTRACT(
    params.input_sol_lamp, 
    vS0.add(params.before_sol_lamp),
    vT0.sub(vtrBefore)
  )

}


/**
 * Convertor SOL → TOKENS for pre-launch with fees
 *
 * beforeAmount — how many SOL (lamport) already in token.
 * inputAmount — additionalAmount SOL (lamport).
 *
 * return ΔT = tokens for inputAmount (decimal)
 */
export function convertSolanaToTokenWithFee(params: {
  input_sol_lamp: BN; // amount SOL before fees (in lamport) to convert to token
  before_lamp?: BN; // amount SOL before fees  reserved in account
  before_in_curve_lamp?: BN; // amount SOL already in curve (in lamport)
}): BN {

  const {inCurve} = splitInput(params.input_sol_lamp)
  const  beforeInCurveLamp = params.before_in_curve_lamp ? 
    params.before_in_curve_lamp :
    params.before_lamp?splitInput(params.before_lamp).inCurve: undefined;
  return convertSolanaToTokenNoFee_Rust({input_sol_lamp: inCurve, before_sol_lamp: beforeInCurveLamp })
}


export function splitInput(inputAmount: BN) {
  const toPamp = inputAmount.muln(99).divn(100);
  const revelcyFee = inputAmount.sub(toPamp);

  const inCurve = inputAmount.muln(987).divn(1000);
  const pumpFee =  inputAmount.sub(inCurve);

  return {
    revelcyFee: revelcyFee, 
    pumpFee: pumpFee,
    inCurve: inCurve,
  }

}
