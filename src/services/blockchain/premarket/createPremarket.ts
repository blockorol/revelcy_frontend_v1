// createPremarket.ts
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getCreatePremarketTransaction,
  signTransactionWithRevelcyAuth,
} from "@api/tx_premarket";
import {
  simulateAndSignRawTx,
} from "@services/blockchain/signAndSend";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";

export interface CreatePremarketArgs {
  metadataUri: string;
  avatarUrl: string;
  premarketAccountPda: string;
  creatorAllocateLamp: BN;
}

export async function createPremarket(
  network: "devnet" | "mainnet-beta",
  wallet: AnchorWallet,
  connection: Connection,
  args: CreatePremarketArgs,
  onChangeState?: (state: string) => void
) {
  
  onChangeState?.("Create transaction...");
  const { transaction, premarket_account_pda } = await getCreatePremarketTransaction(
    {
      premarket_pubkey: args.premarketAccountPda,
      uri: args.metadataUri,
      image_url: args.avatarUrl,
      creator_allocate_lamp: args.creatorAllocateLamp
    },
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
  onChangeState?.("Send transaction to blockchain...");
  const { signature, status } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "create_premarket"
  });
  
  userSetAdditionalInfo({
    premarket: premarket_account_pda,
    eventType: "create_premarket"
  })

  onChangeState?.(`Waiting to tx finalisation. Current status: ${status}...`);
  return {
    txId: signature,
    premarketPDA: premarket_account_pda,
  }
}
