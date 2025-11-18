import BN from "bn.js"

interface Currency {
  amount: BN;
  zeros: number;
  
  getFloat(): number
  getBN(): BN
}


const TOKEN_MULTIPLIER=1_000_000;
const TOKEN_MULTIPLIER_BIG_INT=new BN(TOKEN_MULTIPLIER);

export const DEFAULT_TOKEN_COUNT=1_000_000_000;
export const DEFAULT_TOKEN_COUNT_DECIMAL=TOKEN_MULTIPLIER_BIG_INT.mul(new BN(DEFAULT_TOKEN_COUNT));

export const virtualSupplyRatioLamp = new BN(30_000_000_000)
export const virtualTokenRatioDecim = new BN(1_073_000_191_000_000).sub(DEFAULT_TOKEN_COUNT_DECIMAL)


// Returns count tokens (in lamport) for Sol amount
export function  convertSolanaToTokenBuy(
  args: {
    sol_amount: BN,    // amount SOL (in lamport) to convert to token
    reserves_sol: BN,  // amount SOL reserved in account
    reserves_token: BN // amount Token reserved in account
  }
): BN {  
    const solToCalc = args.reserves_sol.add(virtualSupplyRatioLamp)
    const tokenToCalc = args.reserves_token.add(virtualTokenRatioDecim)
    const res = tokenToCalc.mul(args.sol_amount).div(args.sol_amount.add(solToCalc))
    return res
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
