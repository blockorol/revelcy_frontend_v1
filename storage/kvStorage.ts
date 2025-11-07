// storage/kvStorage.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface KVStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const webStorage: KVStorage = {
  async getItem(key) {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(key, value); } catch {}
  },
  async removeItem(key) {
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(key); } catch {}
  },
};

const nativeStorage: KVStorage = {
  getItem: (k) => AsyncStorage.getItem(k),
  setItem: (k, v) => AsyncStorage.setItem(k, v),
  removeItem: (k) => AsyncStorage.removeItem(k),
};

export const kvStorage: KVStorage = Platform.OS === "web" ? webStorage : nativeStorage;
