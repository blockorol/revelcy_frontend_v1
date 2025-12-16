import { Platform, PlatformOSType } from "react-native";
import Constants from "expo-constants";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

type EnvVars = {
  PINATA_JWT?: string;
  PINATA_API_KEY?: string;
  PINATA_SECRET_KEY?: string;
  HOST_BACKEND?: string;
  HELIUS_KEY?: string;
  TRITON_URL?: string;
  NETWORK?: "devnet" | "mainnet-beta";
  IS_VESTING_ENABLE?: string;
};

let ENV: EnvVars = getEnv(Platform.OS);

function getEnv(platform: PlatformOSType): EnvVars {
  if (platform === "web") {
    // Web: use Constants (Expo Dev), fallback to process.env (Vercel)
    const extra = Constants.expoConfig?.extra ?? {};
    return {
      PINATA_JWT: extra.PINATA_JWT ?? process.env.PINATA_JWT,
      PINATA_API_KEY: extra.PINATA_API_KEY ?? process.env.PINATA_API_KEY,
      PINATA_SECRET_KEY:
        extra.PINATA_SECRET_KEY ?? process.env.PINATA_SECRET_KEY,
      HOST_BACKEND: extra.HOST_BACKEND ?? process.env.HOST_BACKEND,
      HELIUS_KEY: extra.HELIUS_KEY ?? process.env.HELIUS_KEY,
      NETWORK: extra.NETWORK ?? process.env.NETWORK,
      TRITON_URL: extra.TRITON_URL ?? process.env.TRITON_URL,
      IS_VESTING_ENABLE: extra.IS_VESTING_ENABLE ?? process.env.IS_VESTING_ENABLE,
    };
  }

  // Native: use @env loaded by babel-plugin-dotenv-import
  try {
    // @ts-ignore
    return require("@env");
  } catch {
    throw new Error("@env is not available on native");
  }
}
export const IsVestingEnable = getRequired("IS_VESTING_ENABLE", ENV.IS_VESTING_ENABLE) ;
// ---- Exported constants ----
export const PINATA_JWT = getRequired("PINATA_JWT", ENV.PINATA_JWT);
export const PINATA_API_KEY = getRequired("PINATA_API_KEY", ENV.PINATA_API_KEY);
export const PINATA_SECRET_KEY = getRequired(
  "PINATA_SECRET_KEY",
  ENV.PINATA_SECRET_KEY
);
export const API_HOST = getRequired("HOST_BACKEND", ENV.HOST_BACKEND);
export const HELIUS_KEY = getRequired("HELIUS_KEY", ENV.HELIUS_KEY);
export const TRITON_URL = getRequired("TRITON_URL", ENV.TRITON_URL);
export const NETWORK = ENV.NETWORK??'devnet';
export const TOKEN_CONVERTOR_SETTINGS = 
  NETWORK === 'devnet' ?
  {
      vS0: '8000000000',
      vT0: '1073000000000000',
      SolTo80Percent: 23.80,
      SolToDisplay: 50,
  }: {
      vS0: '30000000000',
      vT0: '1073000191000000',
      SolTo80Percent: 86.6,
      SolToDisplay: 100,
  }

// ---- Helpers ----

function getRequired(name: string, value?: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function getRequiredKeypair(name: string, value?: string): Keypair {
  const key = getRequired(name, value);
  try {
    return Keypair.fromSecretKey(bs58.decode(key));
  } catch (e) {
    console.error(`Failed to decode ${name}`, e);
    throw e;
  }
}
