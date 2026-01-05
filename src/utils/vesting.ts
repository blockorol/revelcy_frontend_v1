export type VestingApiResponse = {
  vested_percent: number;   // 0..100
  claimed_percent: number;  // 0..vested_percent
  // optional (если бэк отдаст абсолюты)
  vested_tokens?: string | number;
  claimed_tokens?: string | number;
};

export type VestingVM = {
  vestedPct: number;
  claimedPct: number;
  vestedTokens: number;
  claimedTokens: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v as any);
  return Number.isFinite(n) ? n : 0;
}
export function toVestingVM(
  api: VestingApiResponse | null | undefined,
  totalTokens: number
): VestingVM {
  const total = Number.isFinite(totalTokens) ? Math.max(0, totalTokens) : 0;

  if (!api || total === 0) {
    return { vestedPct: 0, claimedPct: 0, vestedTokens: 0, claimedTokens: 0 };
  }

  let vestedPct = clamp(toNumber(api.vested_percent), 0, 100);
  let claimedPct = clamp(toNumber(api.claimed_percent), 0, vestedPct);

  // если бэк отдаёт абсолюты — используем их, иначе считаем от total
  let vestedTokens =
    api.vested_tokens != null ? clamp(toNumber(api.vested_tokens), 0, total) : (total * vestedPct) / 100;

  let claimedTokens =
    api.claimed_tokens != null
      ? clamp(toNumber(api.claimed_tokens), 0, vestedTokens)
      : (total * claimedPct) / 100;

  vestedTokens = clamp(vestedTokens, 0, total);
  claimedTokens = clamp(claimedTokens, 0, vestedTokens);

  return { vestedPct, claimedPct, vestedTokens, claimedTokens };
}
