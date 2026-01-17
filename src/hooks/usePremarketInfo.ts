// usePremarketInfo.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { getPremarketInfo, TokenInfo } from "@api/token";

export function usePremarketInfo(tokenId: string) {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const fetchOnce = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPremarketInfo({ tokenPubkeyOrShortUrl: tokenId });
      if (!data) throw new Error("No data");
      if (alive.current) setToken(data);
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => { fetchOnce(); }, [fetchOnce]);

  const refetch = fetchOnce;

  return { token, loading, error, refetch, setToken };
}
