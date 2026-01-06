import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getExtendPremarketTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, confirmTxFinalised } from "@services/blockchain/signAndSend";

export async function extendPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  newDeadline: number,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  console.log("Extending premarket with args:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    newDeadline,
    network,
  });

  const { transaction } = await getExtendPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network,
    newDeadline
  );

  console.log("Unsigned extend transaction created by BE:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    newDeadline,
    network,
    transaction,
  });

  // 1) Симуляция + подпись пользователем
  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Extend transaction signed by wallet, sending to BE for Revelcy signature...");

  // 2) Подпись на бэкенде и отправка
  onChangeState?.("Send transaction to blockchain...");
  const { signature, status } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "extend_premarket",
    premarket: premarketAccount.toBase58(),
  });

  onChangeState?.(`Waiting to tx ${signature} finalisation. Current status: ${status}}...`);
  try {
    await confirmTxFinalised(connection, signature);
  } catch (e) {
    console.error("transation is not finalised!", e)
    throw e
  }

  console.log("transaction finalised!");
  return { txId: signature }
}
