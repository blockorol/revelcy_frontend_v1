import BN from "bn.js";
// copyPaste from @pump-fun/pump-sdk/src/bondingCurve

export function getBuyTokenAmountFromSolAmountQuote({
  inputAmount,
  virtualTokenReserves,
  virtualSolReserves,
}: {
  inputAmount: BN;
  virtualTokenReserves: BN;
  virtualSolReserves: BN;
}): BN {
  return inputAmount
    .mul(virtualTokenReserves)
    .div(virtualSolReserves.add(inputAmount));
}

export function getBuySolAmountFromTokenAmountQuote({
  minAmount,
  virtualTokenReserves,
  virtualSolReserves,
}: {
  minAmount: BN;
  virtualTokenReserves: BN;
  virtualSolReserves: BN;
}): BN {
  return minAmount
    .mul(virtualSolReserves)
    .div(virtualTokenReserves.sub(minAmount))
    .add(new BN(1));
}

export function pumpfunBuyQuote({
  curveIn,
  virtualSolReserves, 
  virtualTokenReserves,
}: {
  curveIn: BN;
  virtualSolReserves: BN;
  virtualTokenReserves: BN;
}) {
  // const curveIn = inputAmount.muln(10000 - feeBps).divn(10000);

  // 2. k = x * y
  const k = virtualSolReserves.mul(virtualTokenReserves);

  // 3. x' = x + curveIn
  const xAfter = virtualSolReserves.add(curveIn);

  // 4. y' = floor(k / x')
  const yAfter = k.div(xAfter);

  // 5. tokensOut = y - y'
  const res =  virtualTokenReserves.sub(yAfter);
  return res
}

export function modifyInputWithFeeBps(
  {
    inputAmount, beforeAmount, feeBps
  }: {
    inputAmount: BN;
    beforeAmount?: BN;
    feeBps?: number;
  }
) {
  const curveIn = feeBps?inputAmount.muln(10000 - feeBps).divn(10000):inputAmount;

  return {
    curveIn: curveIn,
    totalCurve: beforeAmount?beforeAmount.add(curveIn): curveIn
  }
}



export function tokensOutFromSol_FROM_OUR_CONTRACT(
  solIn: BN,
  virtualSolReserves: BN,
  virtualTokenReserves: BN
): BN {
  // numerator = virtual_token_reserves * sol_in
  const numerator = virtualTokenReserves.mul(solIn); // BN * BN 

  // denominator = virtual_sol_reserves + sol_in
  const denominator = virtualSolReserves.add(solIn);

  // floor division, same as Rust u128 / u128
  return numerator.div(denominator);
}
