import BN from "bn.js";
import { getGlobalFast } from "@services/pumpfun/pumpGlobalCache";
import { getBuySolAmountFromTokenAmountQuote, getBuyTokenAmountFromSolAmountQuote, modifyInputWithFeeBps, pumpfunBuyQuote, tokensOutFromSol_FROM_OUR_CONTRACT } from "@services/pumpfun/copyPastedMethods";

/**
 * Convertor SOL → TOKENS for pre-launch without fees
 *
 * beforeAmount — how many SOL (lamport) already in token.
 * inputAmount — additionalAmount SOL (lamport).
 *
 * return ΔT = tokens for inputAmount (decimal)
 */
export function convertSolanaToTokenNoFee(params: {
  input_sol_lamp: BN; // amount SOL (in lamport) to convert to token
  before_sol_lamp?: BN; // amount SOL reserved in account
}): BN {
  const global =  getGlobalFast();

  // const vS0 = global.initialVirtualSolReserves;
  // const vS0 = global.initialVirtualSolReserves // WTF!????? this value better!
  // const vT0 = global.initialVirtualTokenReserves;
  
  const vS0 = new BN('30000000000')
  // const vT0 = new BN('1280000000000000'); // 1_073_741_824_000_000
  // const vT0 = new BN('1073741824000000'); // 1_073_741_824_000_000
  const vT0 = new BN('1179900000000000'); // 1_073_741_824_000_000

  // const feeBps = global.feeBasisPoints.toNumber()
  const feeBps = 1000

  // const feeBps = 0

  const {totalCurve} = modifyInputWithFeeBps({
    inputAmount: params.input_sol_lamp,
    beforeAmount: params.before_sol_lamp,
    feeBps: feeBps,
  })
  console.log("global", {
    initialVirtualSolReserves: vS0.toString(), 
    initialVirtualTokenReserves: vT0.toString(),
    inputAmount: params.input_sol_lamp.toString(),
    totalCurve: totalCurve.toString(),
    feeBps: feeBps,
  })
  if (!params.before_sol_lamp || params.before_sol_lamp.eqn(0)) {
    return pumpfunBuyQuote({
      virtualSolReserves: vS0,
      virtualTokenReserves: vT0,
      curveIn: totalCurve,
    });
  }

  const currectTokenSelledTotal = pumpfunBuyQuote({
    virtualSolReserves: vS0,
    virtualTokenReserves: vT0,
    curveIn: params.before_sol_lamp,
  });

  let newTokenSelledTotal = pumpfunBuyQuote({
    virtualSolReserves: vS0,
    virtualTokenReserves: vT0,
    curveIn: totalCurve,
  });

  if (newTokenSelledTotal.gt(global.tokenTotalSupply)) {
    // TODO: check what should we do here!!!!
    newTokenSelledTotal = global.tokenTotalSupply;
  }

  const tokensOut = newTokenSelledTotal.sub(currectTokenSelledTotal);
  return tokensOut;
}

export function convertSolanaToTokenNoFee_Rust(params: {
  input_sol_lamp: BN; // amount SOL (in lamport) to convert to token
  before_sol_lamp?: BN; // amount SOL reserved in account
}): BN {
  const vS0 = new BN('30000000000')
  // const vT0 = new BN('1280000000000000'); // 1_073_741_824_000_000
  // const vT0 = new BN('1073741824000000'); // 1_073_741_824_000_000
  const vT0 = new BN('1073741824000000'); // 1_073_741_824_000_000
  // const vT0 = new BN('1179900000000000'); // 1_073_741_824_000_000

  
  

  // 1073000000000000
  // 0793100000000000
  // 1866100000000000

  // 1072642475650061
  // 0792742475650061
  // 0279900000000000

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
 * Convertor SOL → TOKENS for pre-launch without fees
 *
 * beforeAmount — how many SOL (lamport) already in token.
 * inputAmount — additionalAmount SOL (lamport).
 *
 * return ΔT = tokens for inputAmount (decimal)
 */
export function convertTokenToSolNoFee(params: {
  input_token_dec: BN; // amount token (in decimal) to convert
  before_token_dec?: BN; // amount token (in decimal) reserved in account
  before_sol_dec_lamp?: BN; // amount sol (in lamport) reserved in account
}): BN {
  const global =  getGlobalFast();

  const vS0 = global.initialVirtualSolReserves;
  const vT0 = global.initialVirtualTokenReserves;
  if (!params.before_token_dec && !params.before_sol_dec_lamp) {
  }

  const currectSolSelledTotal = 
  params.before_token_dec ?
  getBuySolAmountFromTokenAmountQuote({
    virtualSolReserves: vS0,
    virtualTokenReserves: vT0,
    minAmount: params.before_token_dec,
  }): params.before_token_dec;
  if (!currectSolSelledTotal) {
    return getBuySolAmountFromTokenAmountQuote({
      virtualSolReserves: vS0,
      virtualTokenReserves: vT0,
      minAmount: params.input_token_dec,
    });
  }

  const currectTokenSelledTotal = params.before_token_dec?? convertSolanaToTokenNoFee({input_sol_lamp:currectSolSelledTotal})


  const afterAmount = currectTokenSelledTotal.add(params.input_token_dec);

  let newSolSelledTotal = getBuySolAmountFromTokenAmountQuote({
    virtualSolReserves: vS0,
    virtualTokenReserves: vT0,
    minAmount: afterAmount,
  });


  const tokensOut = newSolSelledTotal.sub(currectSolSelledTotal);
  return tokensOut;
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
  input_sol_lamp: BN; // amount SOL (in lamport) to convert to token
  before_sol_lamp?: BN; // amount SOL reserved in account
}): BN {
  return convertSolanaToTokenNoFee(params) // TODO: FIX ME!!!!
}