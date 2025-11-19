// pumpGlobalCache.ts
import BN from "bn.js";
import {  getSolanaConnection } from "@services/blockchain/solana";
import { OnlinePumpSdk, getBuyTokenAmountFromSolAmount } from "@pump-fun/pump-sdk";
import { NETWORK } from "env";
import { PublicKey } from "@solana/web3.js";

type Global = Parameters<typeof getBuyTokenAmountFromSolAmount>[0]["global"];

const ONE_HOUR_MS = 60 * 60 * 1000;

const  DEFAULT_GLOBAL: Global = {
  initialVirtualSolReserves: new BN(30_000_000_000),
  initialVirtualTokenReserves: new BN("1073741824000000"),
  tokenTotalSupply: new BN("900000000000000"),
  initialRealTokenReserves: new BN(0),

  creatorFeeBasisPoints: new BN(0),
  feeBasisPoints: new BN(500),
  mayhemModeEnabled: false,
  authority: PublicKey.default,

  initialized: false,
  feeRecipient: PublicKey.default,
  withdrawAuthority: PublicKey.default,
  enableMigrate: false,
  poolMigrationFee: new BN(0),
  feeRecipients: [],
  setCreatorAuthority: PublicKey.default,
  adminSetCreatorAuthority: PublicKey.default,
  createV2Enabled: false,
  whitelistPda: PublicKey.default,
  reservedFeeRecipient: PublicKey.default,
};



const connection = getSolanaConnection('mainnet-beta');
const onlineSdk = new OnlinePumpSdk(connection);

let cachedGlobal: Global = DEFAULT_GLOBAL;
let cachedAt: number | null = null;
let inFlight: Promise<void> | null = null;

/**
 * Внутренний async-обновитель кеша.
 * НЕ вызывается напрямую с await снаружи – только fire-and-forget.
 */
async function refreshGlobalInBackground() {
  if (inFlight) return;

  inFlight = (async () => {
    try {
      const g = await onlineSdk.fetchGlobal();
      cachedGlobal = g as Global;
      cachedAt = Date.now();
    } catch (e) {
      console.error("[pumpGlobalCache] failed to refresh global:", e);
      // при ошибке просто оставляем старое значение (или DEFAULT_GLOBAL)
    } finally {
      inFlight = null;
    }
  })();

  // Не await-им здесь — пусть живёт своей жизнью
  void inFlight;
}

/**
 * Синхронный быстрый доступ к Global:
 *
 * - ВСЕГДА возвращает Global (либо кеш, либо DEFAULT_GLOBAL)
 * - если данные устарели — запускает фоновое обновление, но не ждёт его
 */
export function getGlobalFast(): Global {
  const now = Date.now();

  const isFresh = true
    // cachedAt !== null && now - cachedAt < ONE_HOUR_MS;

  if (!isFresh) {
    // Кеш пустой или устаревший → запускаем обновление в фоне
    refreshGlobalInBackground();
  }

  // Возвращаем то, что есть:
  // - либо актуальный global
  // - либо ещё не обновлённый, но кешированный
  // - либо DEFAULT_GLOBAL, если ещё ни разу не было успешного запроса
  return cachedGlobal;
}

export function getTotalSuply(): BN {
  const global = getGlobalFast()
  return global.tokenTotalSupply
}

/**
 * Опционально: ручной форс-рефреш (если где-то нужен await)
 */
export async function forceRefreshGlobal(): Promise<Global> {
  await refreshGlobalInBackground();
  return cachedGlobal;
}
