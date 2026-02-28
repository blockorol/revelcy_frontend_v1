import { getListShortUserInfo, ShortUserInfo } from "@api/auth";
import { useEffect, useMemo, useState } from "react";

type ShortUserInfoMap = Record<string, ShortUserInfo>;

export function useShortUserInfoList(addresses: string[]) {
  const [shortInfoMap, setShortInfoMap] = useState<ShortUserInfoMap>({});

  const uniqueAddresses = useMemo(
    () => Array.from(new Set(addresses.filter(Boolean))),
    [addresses]
  );

  useEffect(() => {
    if (!uniqueAddresses.length) return;

    // Default values are available immediately: only address.
    setShortInfoMap((prev) => {
      const next = { ...prev };
      uniqueAddresses.forEach((address) => {
        if (!next[address]) {
          next[address] = { address };
        }
      });
      return next;
    });

    let disposed = false;

    (async () => {
      try {
        const users = await getListShortUserInfo(uniqueAddresses);
        if (disposed) return;

        setShortInfoMap((prev) => {
          const next = { ...prev };
          users.forEach((user) => {
            next[user.address] = {
              ...next[user.address],
              ...user,
              address: user.address,
            };
          });
          return next;
        });
      } catch (error) {
        console.warn("[useShortUserInfoList] failed to get short user info", error);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [uniqueAddresses]);

  return { shortInfoMap };
}
