// usePremarketInfo.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUserEntry, UserEntry } from "@api/token";

export function useHolderEntryInfo(premarketPubkey?: string, userWallet?: string) {
  const [holderEntryInfo, setHolderEntryInfo] = useState<UserEntry | null>(null);
  const [whitelistStatus, setWhitelistStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    setHolderEntryInfo(null);
    setWhitelistStatus(undefined);
    setError(null);
    if (!premarketPubkey || !userWallet) setLoading(false);
  }, [premarketPubkey, userWallet]);

  const fetchOnce = useCallback(async () => {
    if (!premarketPubkey || !userWallet) {
      if (alive.current) {
        setHolderEntryInfo(null);
        setWhitelistStatus(undefined);
        setError(null);
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserEntry(premarketPubkey, userWallet);
      if (!alive.current) return;
      setHolderEntryInfo(data.entry);
      setWhitelistStatus(data.whitelistStatus);
    } catch (e) {
      if (alive.current) {
        setHolderEntryInfo(null);
        setWhitelistStatus(undefined);
        setError(e);
      }
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [premarketPubkey, userWallet]);

  useEffect(() => { fetchOnce(); }, [fetchOnce]);

  const refetch = fetchOnce;

  return { holderEntryInfo, whitelistStatus, loading, error, refetch, setHolderEntryInfo };
}
