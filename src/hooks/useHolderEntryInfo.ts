// usePremarketInfo.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUserEntry, UserEntry } from "@api/token";

export function useHolderEntryInfo(premarketPubkey?: string, userWallet?: string) {
  const [holderEntryInfo, setHolderEntryInfo] = useState<UserEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const fetchOnce = useCallback(async () => {
    if (!premarketPubkey || !userWallet) {
        return
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserEntry(premarketPubkey, userWallet);
      if (!data) throw new Error("No data");
      if (alive.current) setHolderEntryInfo(data);
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [premarketPubkey, userWallet]);

  useEffect(() => { fetchOnce(); }, [fetchOnce]);

  const refetch = fetchOnce;

  return { holderEntryInfo, loading, error, refetch, setHolderEntryInfo };
}
