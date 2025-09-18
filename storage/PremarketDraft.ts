// hooks/usePremarketDraft.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FlowStep = 1|2|3|4|6|7;

export interface PremarketDraft<TMain, TTok, TPrem, TCustom> {
  step: FlowStep;
  tokenMainData?: TMain;
  tokenomicsData?: TTok;
  premarketSettingsData?: TPrem;
  customizeTokenData?: TCustom;
  updatedAt: number;
  // версия на будущее для миграций
  __v?: number;
}

const VERSION = 1;

export function draftKey(userId?: string, network?: string) {
  // чтобы у разных пользователей/сетей были разные черновики
  const u = userId || 'guest';
  const net = network || 'default';
  return `premarket_draft:${VERSION}:${u}:${net}`;
}

export async function loadDraft<TMain,TTok,TPrem,TCustom>(
  key: string
): Promise<PremarketDraft<TMain,TTok,TPrem,TCustom> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export async function saveDraft<TMain,TTok,TPrem,TCustom>(
  key: string,
  patch: Partial<PremarketDraft<TMain,TTok,TPrem,TCustom>>
) {
  const current = await loadDraft<TMain,TTok,TPrem,TCustom>(key);
  const merged: PremarketDraft<TMain,TTok,TPrem,TCustom> = {
    step: current?.step ?? 1,
    tokenMainData: current?.tokenMainData,
    tokenomicsData: current?.tokenomicsData,
    premarketSettingsData: current?.premarketSettingsData,
    customizeTokenData: current?.customizeTokenData,
    updatedAt: Date.now(),
    __v: VERSION,
    ...patch,
  };
  await AsyncStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

export async function clearDraft(key: string) {
  try { await AsyncStorage.removeItem(key); } catch {}
}
