// fingerprint/types.ts
export type WalletKind = "extension" | "mobile" | "unknown";

export type WalletInfo = {
  provider?: "phantom" | "unknown";
  kind?: WalletKind;
  adapter?: string;        // optional: your adapter name/version
  isPhantom?: boolean;     // web-only usually
};

export type ScreenInfo = { w: number; h: number };
export type ViewportInfo = { w: number; h: number };

export type ClientContext = {
  // identifiers
  installId?: string;            // stable per device/browser install
  installIdSource?: "cookie" | "localStorage" | "secureStore" | "asyncStorage" | "unknown";

  // time / locale
  capturedAtMs: number;
  timezone?: string;             // IANA, e.g. "Europe/Berlin"
  locale?: string;               // navigator.language / RN locale
  languages?: string[];          // navigator.languages

  // display
  screen?: ScreenInfo;
  viewport?: ViewportInfo;
  pixelRatio?: number;

  // web-ish (client-reported)
  userAgent?: string;

  // wallet
  wallet?: WalletInfo;
};
