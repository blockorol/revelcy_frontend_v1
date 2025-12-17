import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getExtendPremarketTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, sendRawTx } from "@services/blockchain/signAndSend";

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

  // 2) Подпись на бэкенде
  onChangeState?.("Signing transaction on backend...");
  const { transaction: backendSignedB64 } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "extend_premarket",
  });

  console.log("Extend transaction signed by backend. Sending to blockchain...");

  // 3) Отправка в сеть
  onChangeState?.("Sending transaction to blockchain...");
  const txSig = await sendRawTx(backendSignedB64, connection);

  console.log("Extend transaction sent and confirmed. Signature:", txSig);

  return { txId: txSig };
}
