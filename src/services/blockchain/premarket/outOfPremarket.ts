import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOutPremarketTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, sendRawTx } from "@services/blockchain/signAndSend";

export async function outOfPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  console.log("Exiting premarket with args:", {
    premarket: premarketAccount.toBase58(),
    wallet: wallet.publicKey.toBase58(),
    network,
  });

  const { transaction } = await getOutPremarketTransaction(
    premarketAccount.toBase58(),
    wallet.publicKey.toBase58(),
    network
  );

  console.log("Unsigned exit transaction created by BE:", {
    premarket: premarketAccount.toBase58(),
    wallet: wallet.publicKey.toBase58(),
    network,
    transaction,
  });

  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Exit transaction signed by wallet, sending to BE for Revelcy signature...");

  onChangeState?.("Signing transaction on backend...");
  const { transaction: backendSignedB64 } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: 'out_of_premarket',
  });

  console.log("Exit transaction signed by backend. Sending to blockchain...");

  onChangeState?.("Sending transaction to blockchain...");
  const txSig = await sendRawTx(backendSignedB64, connection);

  console.log("Exit transaction sent and confirmed. Signature:", txSig);

  return { txId: txSig };
}
