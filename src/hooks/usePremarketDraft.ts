// hooks/usePremarketDraft.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { kvStorage } from "@storage/kvStorage";

/** Шаги мастера */
export type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Структура черновика */
export interface PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting = unknown> {
  step: FlowStep;
  tokenMainData?: TMain;
  tokenomicsData?: TTok;
  premarketSettingsData?: TPrem;
  customizeTokenData?: TCustom;
  whitelistData?: unknown;
  vestingData?: TVesting;
  updatedAt: number;
  __v?: number;
}

const VERSION = 4;

/** Device-scoped ключ без привязки к пользователю/сети */
export function draftKey() {
  return `premarket_draft:${VERSION}`;
}

/* ---------- helpers ---------- */

function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  label = "timeout"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(label)), ms);
    p.then((v) => {
      clearTimeout(id);
      resolve(v);
    }).catch((e) => {
      clearTimeout(id);
      reject(e);
    });
  });
}

async function loadDraft<TMain, TTok, TPrem, TCustom, TVesting>(
  key: string
): Promise<PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting> | null> {
  try {
    const raw = await kvStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveDraft<TMain, TTok, TPrem, TCustom, TVesting>(
  key: string,
  patch: Partial<PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting>>
) {
  const current = await loadDraft<TMain, TTok, TPrem, TCustom, TVesting>(key);
  const merged: PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting> = {
    step: (current?.step ?? 1) as FlowStep,
    tokenMainData: current?.tokenMainData,
    tokenomicsData: current?.tokenomicsData,
    premarketSettingsData: current?.premarketSettingsData,
    customizeTokenData: current?.customizeTokenData,
    whitelistData: current?.whitelistData,
    vestingData: current?.vestingData,
    updatedAt: Date.now(),
    __v: VERSION,
    ...patch,
  };
  await kvStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

async function clearDraft(key: string) {
  try {
    await kvStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/* ---------- hook ---------- */

type UsePremarketDraftOptions<TMain, TTok, TPrem, TCustom, TVesting> = {
  key?: string;
  loadTimeoutMs?: number; // default 1500
  retry?: number; // default 0
  clearOnTimeout?: boolean; // default false
  normalizeStep?: (s: FlowStep) => FlowStep;
  onRestore?: (d: PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting>) => void;
  initialDraft?: Partial<PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting>>;
};

export function usePremarketDraft<TMain, TTok, TPrem, TCustom, TVesting = unknown>(
  opts: UsePremarketDraftOptions<TMain, TTok, TPrem, TCustom, TVesting> = {}
) {
  const {
    key = draftKey(),
    loadTimeoutMs = 1500,
    retry = 0,
    clearOnTimeout = false,
    normalizeStep,
    onRestore,
    initialDraft,
  } = opts;

  // стабильные опции через ref
  const onRestoreRef = useRef(onRestore);
  const normalizeStepRef = useRef(normalizeStep);
  const initialDraftRef = useRef(initialDraft);
  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);
  useEffect(() => {
    normalizeStepRef.current = normalizeStep;
  }, [normalizeStep]);
  useEffect(() => {
    initialDraftRef.current = initialDraft;
  }, [initialDraft]);

  const [draft, setDraft] = useState<PremarketDraft<
    TMain,
    TTok,
    TPrem,
    TCustom,
    TVesting
  > | null>(null);
  const [loading, setLoading] = useState(true); // только на ПЕРВОЙ загрузке
  const [ready, setReady] = useState(false); // данные готовы
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const initializingRef = useRef(true); // true только до конца первой попытки (с ретраями)

  const reset = useCallback(async () => {
    const base: PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting> = {
      step: ((initialDraftRef.current?.step ?? 1) as FlowStep),
      tokenMainData: initialDraftRef.current?.tokenMainData,
      tokenomicsData: initialDraftRef.current?.tokenomicsData,
      premarketSettingsData: initialDraftRef.current?.premarketSettingsData,
      customizeTokenData: initialDraftRef.current?.customizeTokenData,
      whitelistData: initialDraftRef.current?.whitelistData,
      vestingData: initialDraftRef.current?.vestingData,
      updatedAt: Date.now(),
      __v: VERSION,
    };
    if (mountedRef.current) setDraft(base);
    await kvStorage.setItem(key, JSON.stringify(base));
  }, [key]);

  const clear = useCallback(async () => {
    await clearDraft(key);
    if (mountedRef.current) setDraft(null);
  }, [key]);

  const patch = useCallback(
    async (p: Partial<PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting>>) => {
      const merged = await saveDraft<TMain, TTok, TPrem, TCustom, TVesting>(key, p);
      if (mountedRef.current) setDraft(merged);
      return merged;
    },
    [key]
  );

  const saveNow = useCallback(
    async (d: PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting>) => {
      const toSave = { ...d, updatedAt: Date.now(), __v: VERSION };
      await kvStorage.setItem(key, JSON.stringify(toSave));
      if (mountedRef.current) setDraft(toSave);
    },
    [key]
  );

  // Первая загрузка: один раз, без "миганий"
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const attempt = async (): Promise<void> => {
      try {
        if (initializingRef.current) setLoading(true);
        if (mountedRef.current) setError(null);

        const loaded = await withTimeout(
          loadDraft<TMain, TTok, TPrem, TCustom, TVesting>(key),
          loadTimeoutMs,
          "loadDraft timeout"
        );
        if (cancelled) return;

        if (loaded) {
          const stepNorm = (normalizeStepRef.current?.(
            loaded.step as FlowStep
          ) ?? loaded.step) as FlowStep;
          const normalized = { ...loaded, step: stepNorm };
          if (mountedRef.current) setDraft(normalized);
          onRestoreRef.current?.(normalized);
        } else {
          if (initialDraftRef.current) {
            const base: PremarketDraft<TMain, TTok, TPrem, TCustom, TVesting> = {
              step: ((initialDraftRef.current.step ?? 1) as FlowStep),
              tokenMainData: initialDraftRef.current.tokenMainData,
              tokenomicsData: initialDraftRef.current.tokenomicsData,
              premarketSettingsData:
                initialDraftRef.current.premarketSettingsData,
              customizeTokenData: initialDraftRef.current.customizeTokenData,
              whitelistData: initialDraftRef.current.whitelistData,
              vestingData: initialDraftRef.current.vestingData,
              updatedAt: Date.now(),
              __v: VERSION,
            };
            if (mountedRef.current) setDraft(base);
            await kvStorage.setItem(key, JSON.stringify(base));
          } else {
            if (mountedRef.current) setDraft(null);
          }
        }

        if (mountedRef.current) setReady(true);
      } catch (e: any) {
        attempts += 1;
        if (attempts <= retry) {
          await new Promise((r) => setTimeout(r, 150));
          if (!cancelled) return attempt();
        }
        if (clearOnTimeout) {
          await clearDraft(key);
          if (mountedRef.current) setDraft(null);
        }
        if (mountedRef.current) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setReady(true);
        }
      } finally {
        if (initializingRef.current) {
          initializingRef.current = false;
          if (mountedRef.current) setLoading(false); // выключаем спиннер ровно один раз
        }
      }
    };

    attempt();
    return () => {
      cancelled = true;
    };
    // ВАЖНО: завися только от стабильных значений
  }, [key, loadTimeoutMs, retry, clearOnTimeout]);

  return useMemo(
    () => ({
      key,
      draft,
      loading, // только на первой инициализации
      ready, // дальше отрисовывай контент
      error,
      patch,
      saveNow,
      clear,
      reset,
    }),
    [key, draft, loading, ready, error, patch, saveNow, clear, reset]
  );
}
