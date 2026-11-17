import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useWallet } from "@storage/wallet-adapter";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

// ⚠️ Подставь свой хук кошелька (у тебя он уже есть в проекте)
// ---------- Pump.fun constants ----------
const PUMP_IDL_URL = "https://raw.githubusercontent.com/pump-fun/pump-public-docs/main/idl/pump.json";
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const SYS_PROGRAM_ID = SystemProgram.programId;

// Seeds from official IDL (bytes correspond to strings like "global", "bonding-curve", "__event_authority") :contentReference[oaicite:2]{index=2}
const SEED_GLOBAL = Buffer.from("global");
const SEED_BONDING_CURVE = Buffer.from("bonding-curve");
const SEED_EVENT_AUTH = Buffer.from("__event_authority");
const SEED_CREATOR_VAULT = Buffer.from("creator-vault");
const SEED_FEE_CONFIG = Buffer.from("fee_config");
const DEFAULT_FEE_PROGRAM_ID = new PublicKey("pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ");
const FEE_CONFIG_SUFFIX = Buffer.from([
  1, 86, 224, 246, 147, 102, 90, 207, 68, 219, 21, 104, 191, 23, 91, 170,
  81, 137, 203, 151, 245, 210, 255, 59, 101, 93, 43, 182, 253, 109, 24, 176,
]);

// ---------- Types for IDL subset ----------
type IdlAccount = {
  name: string;
  writable?: boolean;
  signer?: boolean;
  address?: string;
};

type IdlArg =
  | { name: string; type: "u64" }
  | { name: string; type: { defined: { name: string } } };

type IdlInstruction = {
  name: string;
  discriminator: number[]; // 8 bytes
  accounts: IdlAccount[];
  args: IdlArg[];
};

type PumpIdl = {
  address: string; // program id
  instructions: IdlInstruction[];
};

// ---------- Helpers ----------
function u64LE(n: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(n);
  return b;
}

/**
 * Anchor Option<bool> encoding: 1 byte tag (0/1), then 1 byte value (0/1) if tag=1
 * (это стандартное borsh-представление Option<T> в Anchor).
 */
function optionBool(v: boolean | null | undefined): Buffer {
  if (v == null) return Buffer.from([0]);
  return Buffer.from([1, v ? 1 : 0]);
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
  return (await r.json()) as T;
}

async function getMintTokenProgram(connection: Connection, mint: PublicKey): Promise<PublicKey> {
  const info = await connection.getAccountInfo(mint, "confirmed");
  if (!info) throw new Error(`Mint account not found: ${mint.toBase58()}`);

  // Mint account owner is token program (Tokenkeg... or TokenzQd... for Token-2022)
  if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;
  return TOKEN_PROGRAM_ID;
}

function deriveGlobal(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_GLOBAL], programId)[0];
}

function deriveBondingCurve(programId: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_BONDING_CURVE, mint.toBuffer()], programId)[0];
}

function deriveEventAuthority(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_EVENT_AUTH], programId)[0];
}

/**
 * Читает feeRecipient из Global аккаунта (Anchor discriminator 8 bytes + bool + pubkey(authority) + pubkey(feeRecipient))
 * Это соответствует старой структуре Global из публичного IDL (и обычно сохраняется). :contentReference[oaicite:3]{index=3}
 * Если pump.fun поменял layout — можно вручную ввести feeRecipient в UI.
 */
async function tryReadFeeRecipientFromGlobal(connection: Connection, globalPk: PublicKey): Promise<PublicKey | null> {
  const ai = await connection.getAccountInfo(globalPk, "confirmed");
  if (!ai?.data) return null;

  const data = ai.data;
  if (data.length < 8 + 1 + 32 + 32) return null;

  const offsetFeeRecipient = 8 + 1 + 32;
  const fee = new PublicKey(data.slice(offsetFeeRecipient, offsetFeeRecipient + 32));
  return fee;
}

type TokenRow = {
  mint: string;
  ata: string;
  amountRaw: bigint; // base units
  decimals: number;
  uiAmount: string;
  tokenProgram: string;
};

async function loadWalletTokens(connection: Connection, owner: PublicKey): Promise<TokenRow[]> {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }, "confirmed");
  const resp2022 = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }, "confirmed");

  const all = [...resp.value, ...resp2022.value];

  const rows: TokenRow[] = [];
  for (const item of all) {
    const parsed: any = item.account.data.parsed;
    const info = parsed?.info;
    if (!info) continue;

    const mint = String(info.mint);
    const ata = item.pubkey.toBase58();
    const tokenAmount = info.tokenAmount;
    const amountRaw = BigInt(tokenAmount.amount ?? "0");
    const decimals = Number(tokenAmount.decimals ?? 0);

    if (amountRaw === 0n) continue;

    rows.push({
      mint,
      ata,
      amountRaw,
      decimals,
      uiAmount: tokenAmount.uiAmountString ?? String(tokenAmount.uiAmount ?? ""),
      tokenProgram: item.account.owner.toBase58(),
    });
  }

  // опционально: сортировать по балансу
  rows.sort((a, b) => (a.amountRaw > b.amountRaw ? -1 : 1));
  return rows;
}

function buildSellIxData(ix: IdlInstruction, amount: bigint, minSolOut: bigint, trackVolume?: boolean | null): Buffer {
  const disc = Buffer.from(ix.discriminator);
  const chunks: Buffer[] = [disc];

  for (const arg of ix.args) {
    if (arg.type === "u64") {
      // по имени можно различать amount/min_sol_output/...
      if (arg.name === "amount") chunks.push(u64LE(amount));
      else if (arg.name === "min_sol_output" || arg.name === "minSolOutput") chunks.push(u64LE(minSolOut));
      else {
        // если какие-то дополнительные u64 — ставим 0 по умолчанию
        chunks.push(u64LE(0n));
      }
      continue;
    }

    const defName = arg.type?.defined?.name;
    if (defName === "OptionBool") {
      chunks.push(optionBool(trackVolume));
      continue;
    }

    throw new Error(`Unsupported arg type in IDL: ${JSON.stringify(arg)}`);
  }

  return Buffer.concat(chunks);
}

async function readBondingCurveCreator(connection: Connection, bondingCurve: PublicKey): Promise<PublicKey> {
  const ai = await connection.getAccountInfo(bondingCurve, "confirmed");
  if (!ai?.data) throw new Error("Bonding curve account not found");

  // Anchor discriminator (8) + 5*u64 (40) + bool (1) -> creator pubkey starts at 49
  const creatorOffset = 8 + 40 + 1;
  if (ai.data.length < creatorOffset + 32) {
    throw new Error(`Bonding curve account is too short: ${ai.data.length}`);
  }
  return new PublicKey(ai.data.slice(creatorOffset, creatorOffset + 32));
}

function deriveCreatorVault(programId: PublicKey, creator: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_CREATOR_VAULT, creator.toBuffer()], programId)[0];
}

function deriveFeeConfig(feeProgram: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_FEE_CONFIG, FEE_CONFIG_SUFFIX], feeProgram)[0];
}

export default function PumpfunSellScreen() {
  const wallet = useWallet();
  const { sendTransaction } = useSolanaWallet();

  const [rpcUrl, setRpcUrl] = useState<string>(clusterApiUrl("devnet"));
  const connection = useMemo(() => new Connection(rpcUrl, "confirmed"), [rpcUrl]);

  const [idl, setIdl] = useState<PumpIdl | null>(null);
  const [loadingIdl, setLoadingIdl] = useState(false);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [mintFilter, setMintFilter] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState<string>("2000"); // 20% для pump-curve ок
  const [feeRecipientOverride, setFeeRecipientOverride] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");

  const pumpProgramId = useMemo(() => {
    if (!idl?.address) return null;
    return new PublicKey(idl.address);
  }, [idl]);

  const sellIxDef = useMemo(() => {
    if (!idl) return null;
    // В актуальном IDL может быть "sell" или "sell_exact_..." — берём "sell" приоритетно
    return (
      idl.instructions.find((x) => x.name === "sell") ||
      idl.instructions.find((x) => x.name.startsWith("sell"))
    );
  }, [idl]);

  const refreshIdl = useCallback(async () => {
    setLoadingIdl(true);
    try {
      const j = await fetchJson<PumpIdl>(PUMP_IDL_URL);
      setIdl(j);
    } finally {
      setLoadingIdl(false);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    if (!wallet.publicKey) return;
    setLoadingTokens(true);
    try {
      const rows = await loadWalletTokens(connection, wallet.publicKey);
      setTokens(rows);
    } finally {
      setLoadingTokens(false);
    }
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    refreshIdl().catch(() => {});
  }, [refreshIdl]);

  useEffect(() => {
    if (wallet.publicKey) refreshTokens().catch(() => {});
  }, [wallet.publicKey, refreshTokens]);

  const visibleTokens = useMemo(() => {
    const f = mintFilter.trim();
    if (!f) return tokens;
    return tokens.filter((t) => t.mint.toLowerCase().includes(f.toLowerCase()));
  }, [tokens, mintFilter]);

  const sellOne = useCallback(
    async (mintStr: string, amountRawToSell: bigint) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      if (!sendTransaction) throw new Error("Wallet adapter cannot send transactions");
      if (!pumpProgramId) throw new Error("IDL not loaded");
      if (!sellIxDef) throw new Error("Sell instruction not found in IDL");

      const user = wallet.publicKey;
      const mint = new PublicKey(mintStr);

      // token program (Tokenkeg vs Token-2022)
      const tokenProgram = await getMintTokenProgram(connection, mint);

      // PDAs
      const global = deriveGlobal(pumpProgramId);
      const bondingCurve = deriveBondingCurve(pumpProgramId, mint);
      const eventAuthority = deriveEventAuthority(pumpProgramId);
      const creator = await readBondingCurveCreator(connection, bondingCurve);
      const creatorVault = deriveCreatorVault(pumpProgramId, creator);
      const feeProgramFromIdl = (() => {
        const feeProgramAcc = sellIxDef.accounts.find((a) => a.name === "fee_program");
        return feeProgramAcc?.address ? new PublicKey(feeProgramAcc.address) : DEFAULT_FEE_PROGRAM_ID;
      })();
      const feeConfig = deriveFeeConfig(feeProgramFromIdl);

      // ATAs
      const associatedUser = getAssociatedTokenAddressSync(mint, user, false, tokenProgram, ASSOCIATED_TOKEN_PROGRAM_ID);
      const associatedBondingCurve = getAssociatedTokenAddressSync(
        mint,
        bondingCurve,
        true, // allowOwnerOffCurve
        tokenProgram,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // feeRecipient
      let feeRecipient: PublicKey | null = null;
      if (feeRecipientOverride.trim()) {
        feeRecipient = new PublicKey(feeRecipientOverride.trim());
      } else {
        feeRecipient = await tryReadFeeRecipientFromGlobal(connection, global);
      }
      if (!feeRecipient) {
        throw new Error("Cannot resolve feeRecipient. Paste it manually in the field.");
      }

      // minSolOut (грубый slippage-контроль):
      // pump.fun проверяет min_out внутри программы; точную котировку можно считать из bonding curve state,
      // но для “просто вернуть SOL” обычно хватает поставить minSolOut=0 и контролировать уже пост-фактум.
      // Если хочешь защиту — ставь 1 или рассчитывай по формулам из docs.
      const minSolOut = 0n;

      // track_volume: если в IDL есть OptionBool — включим
      const wantsTrackVolume = true;

      const data = buildSellIxData(sellIxDef, amountRawToSell, minSolOut, wantsTrackVolume);

      // Собираем accounts строго в том порядке, который требует IDL.
      // Для аккаунтов, которые IDL помечает address — берём address из IDL.
      const keys = sellIxDef.accounts.map((acc) => {
        const name = acc.name;

        let pubkey: PublicKey;
        if (acc.address) {
          pubkey = new PublicKey(acc.address);
        } else if (name === "global") pubkey = global;
        else if (name === "fee_recipient") pubkey = feeRecipient!;
        else if (name === "mint") pubkey = mint;
        else if (name === "bonding_curve") pubkey = bondingCurve;
        else if (name === "associated_bonding_curve") pubkey = associatedBondingCurve;
        else if (name === "associated_user") pubkey = associatedUser;
        else if (name === "user") pubkey = user;
        else if (name === "system_program") pubkey = SYS_PROGRAM_ID;
        else if (name === "associated_token_program") pubkey = ASSOCIATED_TOKEN_PROGRAM_ID;
        else if (name === "token_program") pubkey = tokenProgram;
        else if (name === "event_authority") pubkey = eventAuthority;
        else if (name === "creator_vault") pubkey = creatorVault;
        else if (name === "fee_config") pubkey = feeConfig;
        else if (name === "fee_program") pubkey = feeProgramFromIdl;
        else if (name === "program") pubkey = pumpProgramId;
        else {
          // ⚠️ В актуальном IDL могут быть дополнительные аккаунты (fee_program, fee_config, volume_accumulators и т.п.)
          // Их можно добавить по аналогии, когда увидишь ошибку "Not enough account keys".
          // Чтобы сразу сделать “полностью”, напиши — и я добавлю derivation под твой текущий IDL.
          throw new Error(`Unsupported/unknown account in IDL: ${name}`);
        }

        return {
          pubkey,
          isSigner: !!acc.signer,
          isWritable: !!acc.writable,
        };
      });

      const ix = new TransactionInstruction({
        programId: pumpProgramId,
        keys,
        data,
      });

      const tx = new Transaction().add(ix);
      tx.feePayer = user;

      const sig = await sendTransaction(tx, connection, { preflightCommitment: "confirmed" });
      return sig;
    },
    [wallet.publicKey, sendTransaction, pumpProgramId, sellIxDef, feeRecipientOverride, connection]
  );

  const sellPercent = useCallback(
    async (t: TokenRow, percent: number) => {
      const amount = (t.amountRaw * BigInt(percent)) / 100n;
      if (amount <= 0n) return;

      // slippageBps сейчас не используется в minSolOut (мы ставим 0),
      // но поле оставлено — если захочешь считать котировку и защищаться.
      void slippageBps;

      setStatusText("Sending sell transaction...");
      try {
        const sig = await sellOne(t.mint, amount);
        console.log("SELL sig:", sig);
        setStatusText(`Sell sent: ${sig}`);
        await refreshTokens();
      } catch (e: any) {
        const message = e?.message ?? "Sell failed";
        console.error("Sell failed:", e);
        setStatusText(message);
      }
    },
    [sellOne, refreshTokens, slippageBps]
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Card>
        <Card.Title title="Pump.fun Sell (bonding curve)" />
        <Card.Content style={{ gap: 10 }}>
          <Text variant="bodyMedium">
            Программа Pump.fun (bonding curve) берётся из official IDL. Program ID:{" "}
            <Text style={{ fontWeight: "700" }}>
              {pumpProgramId?.toBase58() ?? "loading..."}
            </Text>
          </Text>

          <TextInput
            label="RPC URL"
            value={rpcUrl}
            onChangeText={setRpcUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button mode="contained" onPress={refreshIdl} loading={loadingIdl}>
              Reload IDL
            </Button>
            <Button mode="contained" onPress={refreshTokens} loading={loadingTokens} disabled={!wallet.publicKey}>
              Reload tokens
            </Button>
          </View>

          <Divider />

          <TextInput
            label="Mint filter"
            value={mintFilter}
            onChangeText={setMintFilter}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Slippage (bps) – reserved for future minOut calc"
            value={slippageBps}
            onChangeText={setSlippageBps}
            keyboardType="number-pad"
          />

          <TextInput
            label="Fee recipient override (optional)"
            value={feeRecipientOverride}
            onChangeText={setFeeRecipientOverride}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="If auto-detect fails, paste pubkey here"
          />

          {!wallet.connected ? (
            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium">Connect wallet to view balances and sell.</Text>
              <Button mode="contained" onPress={wallet.connect}>
                Connect wallet
              </Button>
            </View>
          ) : null}

          {!sellIxDef ? (
            <Text variant="bodyMedium">
              Не нашёл sell-инструкцию в IDL. (IDL может поменяться.) Попробуй Reload IDL.
            </Text>
          ) : null}
          {statusText ? <Text variant="bodySmall">{statusText}</Text> : null}
        </Card.Content>
      </Card>

      {visibleTokens.map((t) => (
        <Card key={t.ata}>
          <Card.Title title={t.mint} subtitle={`Balance: ${t.uiAmount}`} />
          <Card.Content style={{ gap: 8 }}>
            <Text variant="bodySmall">ATA: {t.ata}</Text>
            <Text variant="bodySmall">Decimals: {t.decimals}</Text>
            <Text variant="bodySmall">Raw amount: {t.amountRaw.toString()}</Text>
            <Text variant="bodySmall">Token program: {t.tokenProgram}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Button mode="outlined" onPress={() => sellPercent(t, 25)} disabled={!sellIxDef || !wallet.connected}>
                Sell 25%
              </Button>
              <Button mode="outlined" onPress={() => sellPercent(t, 50)} disabled={!sellIxDef || !wallet.connected}>
                Sell 50%
              </Button>
              <Button mode="contained" onPress={() => sellPercent(t, 100)} disabled={!sellIxDef || !wallet.connected}>
                Sell 100%
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      {wallet.connected && visibleTokens.length === 0 ? (
        <Text variant="bodyMedium">Нет токенов по фильтру (или на кошельке нет SPL балансов).</Text>
      ) : null}
    </ScrollView>
  );
}


