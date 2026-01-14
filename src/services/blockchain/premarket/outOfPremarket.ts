import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOutPremarketTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, confirmTxFinalised } from "@services/blockchain/signAndSend";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";

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

  onChangeState?.("Send transaction to blockchain...");
  const { signature, status } = await signTransactionWithRevelcyAuth({
    OutOfPremarket: {
      network,
      unsigned_tx: userSignedB64,
    }
  });
  
  userSetAdditionalInfo({
    premarket: premarketAccount.toBase58(),
    eventType: "out_of_premarket"
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
