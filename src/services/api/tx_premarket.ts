// @api/tx_premarket.ts
import { API_HOST } from "env";
import { BN } from "@coral-xyz/anchor";
import { http } from "@api/http";

export type Network = "devnet" | "mainnet-beta";

const RETRY_TX_GEN = 3;

/* ===== Create Premarket ===== */

export interface CreatePremarketTxResponse {
  transaction: string;            // base64(Transaction)
  premarket_account_pda: string;  // base58
  mint_address: string;
}

export interface CreatePremarketTxRequest {
  network: Network;
  user_pubkey: string; // base58
  name: string;
  symbol: string;
  uri: string;
  deadline: number;               // unix sec
  goal_sol_lamp: string;          // u64 as string
  max_sol_lamp: string;           // u64 as string
  creator_allocate_lamp: string;  // u64 as string
}

export interface CreatePremarketArgs {
  name: string;
  symbol: string;
  uri: string;
  deadline: number;               // unix sec
  goal_sol_lamp: BN;
  max_sol_lamp: BN;
  creator_allocate_lamp: BN;
}

export async function getCreatePremarketTransaction(
  argsPremarket: CreatePremarketArgs,
  userPubkeyBase58: string,
  network: Network
): Promise<CreatePremarketTxResponse> {
  const payload: CreatePremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    name: argsPremarket.name,
    symbol: argsPremarket.symbol,
    uri: argsPremarket.uri,
    deadline: argsPremarket.deadline,
    goal_sol_lamp: toDecString(argsPremarket.goal_sol_lamp),
    max_sol_lamp: toDecString(argsPremarket.max_sol_lamp),
    creator_allocate_lamp: toDecString(argsPremarket.creator_allocate_lamp),
  };
  console.log("payload", payload);

  ensureDec("goal_sol_lamp", payload.goal_sol_lamp);
  ensureDec("max_sol_lamp", payload.max_sol_lamp);
  ensureDec("creator_allocate_lamp", payload.creator_allocate_lamp);
  try {
    const data = await http.post<CreatePremarketTxResponse>(
      `${API_HOST}/premarket/tx/create`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to get create_premarket tx: ${e.message ?? "Unknown error"}`);
  }
}

/* ===== Join / Out ===== */

export interface TxOnlyResponse {
  transaction: string; // base64(Transaction)
}

export interface JoinPremarketTxRequest {
  network: Network;
  user_pubkey: string;        // base58
  premarket_account: string;  // base58
  amount_sol_lamp: string;    // u64 as string
}

export async function getJoinPremarketTransaction(
  premarketAccountBase58: string,
  amountSolLamp: BN,
  userPubkeyBase58: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: JoinPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    amount_sol_lamp: toDecString(amountSolLamp),
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/join`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get join tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface OutPremarketTxRequest {
  network: Network;
  user_pubkey: string;        // base58
  premarket_account: string;  // base58
}

export async function getOutPremarketTransaction(
  premarketAccountBase58: string,
  userPubkeyBase58: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: OutPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/out`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get out tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface FinishPremarketTxRequest {
  network: "devnet" | "mainnet-beta";
  user_pubkey: string;
  premarket_account: string;
}

export async function getFinishPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta"
): Promise<TxOnlyResponse> {
  const payload = { network, user_pubkey: userPubkeyBase58, premarket_account: premarketAccountBase58 };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/finish`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get finish tx: ${e?.message ?? "Unknown error"}`);
  }
}

export async function getRefundPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta"
): Promise<TxOnlyResponse> {
  const payload = { network, user_pubkey: userPubkeyBase58, premarket_account: premarketAccountBase58 };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/kill`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get kill tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface ExtendPremarketTxRequest {
  network: "devnet" | "mainnet-beta";
  user_pubkey: string;
  premarket_account: string;
  new_deadline: number; // unix sec
}

export async function getExtendPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta",
  newDeadline: number
): Promise<TxOnlyResponse> {
  const payload: ExtendPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    new_deadline: newDeadline,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/extend_premarket`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get extend premarket tx: ${e?.message ?? "Unknown error"}`);
  }
}

export function toDecString(x: BN | string | number | bigint): string {
  if (BN.isBN(x)) return (x as BN).toString(10);
  if (typeof x === "bigint") return x.toString(10);
  if (typeof x === "number") return Math.trunc(x).toString(10);
  if (typeof x === "string") {
    const s = x.trim();
    if (/^0x[0-9a-f]+$/i.test(s)) return new BN(s.slice(2), 16).toString(10);
    if (/^[0-9a-f]+$/i.test(s) && /[a-f]/i.test(s)) return new BN(s, 16).toString(10);
    if (/^\d+$/.test(s)) return s;
    throw new Error(`Invalid numeric string: "${x}"`);
  }
  throw new Error(`Unsupported type: ${typeof x}`);
}

export function ensureDec(name: string, v: string) {
  if (!/^\d+$/.test(v)) throw new Error(`${name} must be a decimal string, got "${v}"`);
}
