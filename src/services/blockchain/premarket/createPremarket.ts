// createPremarket.ts
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getCreatePremarketTransaction,
  signTransactionWithRevelcyAuth,
} from "@api/tx_premarket";
import {
  simulateAndSignRawTx,
  sendRawTx,
} from "@services/blockchain/signAndSend";

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
  console.log("Creating premarket with args:", args);

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

  console.log("Unsigned transaction created by BE:", {
    ...args,
    wallet: wallet.publicKey.toBase58(),
    network,
    transaction,
    pda: premarket_account_pda,
  });

  // 2) Симуляция + подпись пользователем
  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Transaction signed by wallet, sending to BE for Revelcy signature...");

  // 3) Отправляем на бекенд для подписи Revelcy
  onChangeState?.("Signing transaction on backend...");
  const { transaction: backendSignedB64 } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "create_premarket"
  });

  console.log("Transaction signed by backend. Sending to blockchain...");

  // 4) Отправка в сеть
  onChangeState?.("Sending transaction to blockchain...");
  const txSig = await sendRawTx(backendSignedB64, connection);

  console.log("Transaction sent and confirmed. Signature:", txSig);

  return {
    txId: txSig,
    premarketPDA: new PublicKey(premarket_account_pda),
    report: txSig,
    mintAddress: mint_address,
  };
}
