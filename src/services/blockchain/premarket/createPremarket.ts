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
  confirmTxFinalised,
} from "@services/blockchain/signAndSend";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";
import { CustomizeTokenData } from "@components/token/create/interface";
import { uriToFile } from "@utils/imageValidation";
import { uploadImage } from "@api/files";

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
  community: CustomizeTokenData, // todo: move this interfase to shared field
  onChangeState?: (state: string) => void, 
  notifyError?: (message: string) => void

) {
  onChangeState?.("Creating transaction...");
  console.log("Creating premarket with args:", args);

  const nowSec = Math.floor(Date.now() / 1000);
  if (args.deadline < nowSec + SECONDS_IN_HOUR - 1) {
    throw new Error(
      `deadline should be more than 1 h after current. now: ${nowSec}, deadline: ${args.deadline}`
    );
  }

  const { transaction, premarket_account_pda } = await getCreatePremarketTransaction(
    args,
    wallet.publicKey.toBase58(),
    network
  );

  try {
    if (community.banner?.data) {
      const fileName = `${premarket_account_pda.toString()}_banner`;
      const file = await uriToFile(community.banner.data, fileName);
      community.banner.url = await uploadImage(file, fileName);
    }
  } catch {
    notifyError?.("Failed to upload community banner. Please, add it again from premarket page");
    community.banner = undefined;
  }

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
    CreatePremarket: {
      network: network,
      unsigned_tx: userSignedB64,
      about_community: community,
    },
  });
  
  userSetAdditionalInfo({
    premarket: premarket_account_pda,
    eventType: "create_premarket"
  })

  onChangeState?.(`Waiting to tx finalisation. Current status: ${status}...`);
  try {
    await confirmTxFinalised(connection, signature);
  } catch (e) {
    console.error("transation is not finalised!", e)
    throw e
  }

  console.log("transaction finalised!");
  return {
    txId: signature,
    premarketPDA: premarket_account_pda,
  }
}
