import BN from "bn.js";

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
