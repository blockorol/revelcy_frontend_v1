import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getCreatePremarketTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

const SECONDS_IN_HOUR = 60 * 60;

export interface CreatePremarketArgs {
  name: string;
  symbol: string;
  uri: string;
  deadline: number;
  goal_sol_lamp: BN;
  max_sol_lamp: BN;
  creator_allocate_lamp: BN;
}

export async function createPremarket(
  network: "devnet" | "mainnet-beta",
  wallet: AnchorWallet,
  connection: Connection,
  args: CreatePremarketArgs,
  onChangeState?: (state: string) => void
) {
  onChangeState?.("Creating transaction...");

  const nowSec = Math.floor(Date.now() / 1000);
  if (args.deadline < nowSec + SECONDS_IN_HOUR - 1) {
    throw new Error(
      `deadline should be more than 1 h after current. now: ${nowSec}, deadline: ${args.deadline}`
    );
  }
  

  const { transaction, premarket_account_pda, mint_address } = await getCreatePremarketTransaction(
    args,
    wallet.publicKey.toBase58(),
    network
  );

  console.log("transaction created by BE:", {
    ...args,
    wallet: wallet.publicKey.toBase58(),
    network: network,
    transaction,
    pda: premarket_account_pda,
  });

  onChangeState?.("Sending transaction to blockchain...");

  const report = await signAndSend(transaction, connection, wallet);

  return {
    txId: report,
    premarketPDA: new PublicKey(premarket_account_pda),
    report,
    mintAddress: mint_address
  };
}
