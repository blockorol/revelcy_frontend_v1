import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getFinishPremarketTransaction,
  getRefundPremarketTransaction,
  signTransactionWithRevelcyAuth,
} from "@api/tx_premarket";
import { simulateAndSignRawTx, confirmTxFinalised } from "@services/blockchain/signAndSend";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";

export async function finishPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  console.log("Finishing premarket with args:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    network,
  });

  const { transaction } = await getFinishPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network
  );

  console.log("Unsigned finish transaction created by BE:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    network,
    transaction,
  });

  // 1) Симуляция + подпись пользователем
  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Finish transaction signed by wallet, sending to BE for Revelcy signature...");

  // 2) Подпись на бэкенде и отправка в сеть
  onChangeState?.("Sending transaction to blockchain...");
  const {signature, status } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "finish_premarket",
    premarket: premarketAccount.toBase58()
  });
    
  userSetAdditionalInfo({
    premarket: premarketAccount.toBase58(),
    eventType: "finish_premarket"
  })

  onChangeState?.(`Waiting to tx finalisation. Current status: ${status}...`);
  try {
    await confirmTxFinalised(connection, signature);
  } catch (e) {
    console.error("transation is not finalised!", e)
    throw e
  }

  console.log("transaction finalised!");
  return { txId: signature }
}

export async function refundPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  console.log("Refunding premarket with args:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    network,
  });

  const { transaction } = await getRefundPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network
  );

  console.log("Unsigned refund transaction created by BE:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    network,
    transaction,
  });

  // 1) Симуляция + подпись пользователем
  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Refund transaction signed by wallet, sending to BE for Revelcy signature...");

  // 2) Подпись на бэкенде
  onChangeState?.("Signing transaction on backend...");
  const {signature, status } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "refund_premarket",
    premarket: premarketAccount.toBase58(), // double check is it expected format or not?
  });


  onChangeState?.(`Waiting to tx finalisation. Current status: ${status}...`);
  try {
    await confirmTxFinalised(connection, signature);
  } catch (e) {
    console.error("transation is not finalised!", e)
    throw e
  }

  console.log("transaction finalised!");
  return { txId: signature }
}
