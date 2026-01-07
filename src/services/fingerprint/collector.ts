// fingerprint/web.ts
import { v4 as uuidv4 } from "uuid";
import type { ClientContext, WalletInfo } from "./types";

/** Minimal cookie helpers (no external deps) */
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function setCookie(name: string, value: string, days = 3650) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const INSTALL_COOKIE = "revelcy_install_id";
const INSTALL_LS_KEY = "revelcy_install_id";

export function getOrCreateInstallIdWeb(): { id: string; source: "cookie" | "localStorage" } {
  // Prefer cookie (survives across subpaths and is easy to read server-side if you need)
  const fromCookie = getCookie(INSTALL_COOKIE);
  if (fromCookie && fromCookie.trim()) return { id: fromCookie, source: "cookie" };

  // Fallback to localStorage
  const fromLS = safeLocalStorageGet(INSTALL_LS_KEY);
  if (fromLS && fromLS.trim()) {
    // also backfill cookie
    setCookie(INSTALL_COOKIE, fromLS);
    return { id: fromLS, source: "localStorage" };
  }

  const id = uuidv4();
  setCookie(INSTALL_COOKIE, id);
  safeLocalStorageSet(INSTALL_LS_KEY, id);
  return { id, source: "cookie" };
}

function safeLocalStorageGet(key: string): string | undefined {
  try {
    return window.localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}
function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function detectWalletWeb(): WalletInfo {
  const w = window as any;

  // Phantom detection patterns (common but not guaranteed stable)
  const solana = w?.solana;
  const phantomFromSolana = !!solana?.isPhantom;
  const phantomFromWindowPhantom = !!w?.phantom?.solana?.isPhantom;

  const isPhantom = phantomFromSolana || phantomFromWindowPhantom;

  return {
    provider: isPhantom ? "phantom" : "unknown",
    kind: "extension",
    isPhantom,
  };
}

export async function collectClientContextWeb(opts?: {
  includeUA?: boolean;    // default true
}): Promise<ClientContext> {
  const { id, source } = getOrCreateInstallIdWeb();

  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  })();

  const locale = navigator.language || undefined;
  const languages = Array.isArray(navigator.languages) ? navigator.languages.slice(0, 10) : undefined;

  const screen = (typeof window !== "undefined" && window.screen)
    ? { w: window.screen.width, h: window.screen.height }
    : undefined;

  const viewport =
    typeof window !== "undefined"
      ? { w: window.innerWidth || 0, h: window.innerHeight || 0 }
      : undefined;

  const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : undefined;

  const ctx: ClientContext = {
    capturedAtMs: Date.now(),
    installId: id,
    installIdSource: source,
    timezone: tz,
    locale,
    languages,
    screen,
    viewport,
    pixelRatio,
    wallet: detectWalletWeb(),
  };

  if (opts?.includeUA ?? true) {
    ctx.userAgent = navigator.userAgent || undefined;
  }

  return ctx;
}

