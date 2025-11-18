// @components/premarket/PremarketList.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
import { PremarketCard } from "@components/premarket/PremarketCard";
import { getPremarketList, TokenMainInfo, fetchTokenDynamicInfo, TokenDynamicInfo } from "@api/token";
import { useIsMobileForDiscoveryContainer } from "@hooks/useIsMobile";
import { convertLamportToSmallCount } from "@utils/premarket";


type OrderValue = "FRESH" | "ACHIEVED" | "TOP_MCAP" | "LOW_MCAP" | "EARLY_DEADLINE" | "LATE_DEADLINE";

type PremarketListProps = {
  initialLimit?: number;
  pageSizeOptions?: number[];
  style?: any;
  containerWidth?: number;
  filter?: "premarket" | "launched" | "my_tokens";
  userWalletAddress?: string;
  order?: OrderValue;
};

export const PremarketList: React.FC<PremarketListProps> = ({
  initialLimit = 30,
  pageSizeOptions = [30, 50, 80],
  style,
  containerWidth,
  filter,
  userWalletAddress,
  order = "FRESH",
}) => {
  const { colors } = useTheme();
  const isMobile = useIsMobileForDiscoveryContainer();

  const [cursor, setCursor] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [items, setItems] = useState<TokenMainInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dynamicInfoMap, setDynamicInfoMap] = useState<Record<string, TokenDynamicInfo>>({});
  const [loadingDynamicInfo, setLoadingDynamicInfo] = useState<Record<string, boolean>>({});

  const fetchDynamicInfo = useCallback(async (premarketPubkey: any) => {
    const pubkeyStr = typeof premarketPubkey === "string" 
      ? premarketPubkey 
      : premarketPubkey?.toBase58?.() || String(premarketPubkey);
    
    setLoadingDynamicInfo(prev => ({ ...prev, [pubkeyStr]: true }));
    
    try {
      const dynamicInfo = await fetchTokenDynamicInfo(pubkeyStr);
      setDynamicInfoMap(prev => ({ ...prev, [pubkeyStr]: dynamicInfo }));
    } catch (e) {
      console.warn(`Failed to fetch dynamic info for ${pubkeyStr}:`, e);
    } finally {
      setLoadingDynamicInfo(prev => ({ ...prev, [pubkeyStr]: false }));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { items, total } = await getPremarketList({ cursor, limit });
      setItems(items);
      setTotal(total);
      
      // Fetch dynamic info for each item
      items.forEach(item => {
        if (item.premarketPubkey) {
          fetchDynamicInfo(item.premarketPubkey);
        }
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [cursor, limit, fetchDynamicInfo]);

  useEffect(() => {
    load();
  }, [load]);

  const canPrev = cursor > 0;
  const canNext = cursor + limit < total;

  const rangeText = useMemo(() => {
    if (total === 0) return "0 of 0";
    const start = Math.min(total, cursor + 1);
    const end = Math.min(total, cursor + items.length);
    return `${start}–${end} of ${total}`;
  }, [cursor, items.length, total]);

  const onChangeLimit = (v: number) => {
    if (v === limit) return;
    setCursor(0);
    setLimit(v);
  };

  const goPrev = () => {
    if (!canPrev) return;
    setCursor(Math.max(0, cursor - limit));
  };
  const goNext = () => {
    if (!canNext) return;
    setCursor(cursor + limit);
  };

  const filterItem = useCallback((it: TokenMainInfo): boolean => {
    if (!filter) return true;
    
    if (filter === "premarket") {
      return it.state === "premarket";
    }
    
    if (filter === "launched") {
      return it.state === "finished";
    }
    
    if (filter === "my_tokens") {
      const key =
        typeof it.premarketPubkey === "string"
          ? it.premarketPubkey
          : typeof (it as any).premarketPubkey?.toBase58 === "function"
          ? (it as any).premarketPubkey.toBase58()
          : String((it as any).premarketPubkey);
      
      const dynamicInfo = dynamicInfoMap[key];
      if (!dynamicInfo || !userWalletAddress) return false;
      
      return dynamicInfo.holders.some(
        (holder) => holder.walletAddress === userWalletAddress
      );
    }
    
    return true;
  }, [filter, dynamicInfoMap, userWalletAddress]);

  const filteredItems = useMemo(() => items.filter(filterItem), [items, filterItem]);

  const getItemKey = useCallback((it: TokenMainInfo): string => {
    return typeof it.premarketPubkey === "string"
      ? it.premarketPubkey
      : typeof (it as any).premarketPubkey?.toBase58 === "function"
      ? (it as any).premarketPubkey.toBase58()
      : String((it as any).premarketPubkey);
  }, []);

  const sortedAndFilteredItems = useMemo(() => {
    const filtered = filteredItems;
    
    if (!order || order === "FRESH") {
      // FRESH: newest premarkets first (sort by premarketCreated descending)
      return [...filtered].sort((a, b) => b.premarketCreated - a.premarketCreated);
    }
    
    if (order === "ACHIEVED") {
      // ACHIEVED: highest achievement percentage first
      return [...filtered].sort((a, b) => {
        const keyA = getItemKey(a);
        const keyB = getItemKey(b);
        const dynamicA = dynamicInfoMap[keyA];
        const dynamicB = dynamicInfoMap[keyB];
        
        // If dynamic info is not loaded, put at the end
        if (!dynamicA && !dynamicB) return 0;
        if (!dynamicA) return 1;
        if (!dynamicB) return -1;
        
        // Calculate achievement percentage: marketCapSolLamp / premarketGoalSolLamp
        const achievementA = convertLamportToSmallCount(dynamicA.marketCapSolLamp) / 
                            convertLamportToSmallCount(a.premarketGoalSolLamp);
        const achievementB = convertLamportToSmallCount(dynamicB.marketCapSolLamp) / 
                            convertLamportToSmallCount(b.premarketGoalSolLamp);
        
        return achievementB - achievementA; // Descending (highest first)
      });
    }
    
    if (order === "TOP_MCAP") {
      // TOP_MCAP: highest market cap first
      return [...filtered].sort((a, b) => {
        const keyA = getItemKey(a);
        const keyB = getItemKey(b);
        const dynamicA = dynamicInfoMap[keyA];
        const dynamicB = dynamicInfoMap[keyB];
        
        // If dynamic info is not loaded, put at the end
        if (!dynamicA && !dynamicB) return 0;
        if (!dynamicA) return 1;
        if (!dynamicB) return -1;
        
        // Compare market cap (BN comparison)
        const cmp = dynamicB.marketCapSolLamp.cmp(dynamicA.marketCapSolLamp);
        return cmp;
      });
    }
    
    if (order === "LOW_MCAP") {
      // LOW_MCAP: lowest market cap first
      return [...filtered].sort((a, b) => {
        const keyA = getItemKey(a);
        const keyB = getItemKey(b);
        const dynamicA = dynamicInfoMap[keyA];
        const dynamicB = dynamicInfoMap[keyB];
        
        // If dynamic info is not loaded, put at the end
        if (!dynamicA && !dynamicB) return 0;
        if (!dynamicA) return 1;
        if (!dynamicB) return -1;
        
        // Compare market cap (BN comparison)
        const cmp = dynamicA.marketCapSolLamp.cmp(dynamicB.marketCapSolLamp);
        return cmp;
      });
    }
    
    if (order === "EARLY_DEADLINE") {
      // EARLY_DEADLINE: earliest deadline first (ascending)
      return [...filtered].sort((a, b) => a.premarketDeadline - b.premarketDeadline);
    }
    
    if (order === "LATE_DEADLINE") {
      // LATE_DEADLINE: latest deadline first (descending)
      return [...filtered].sort((a, b) => b.premarketDeadline - a.premarketDeadline);
    }
    
    return filtered;
  }, [filteredItems, order, dynamicInfoMap, getItemKey]);

  const styles = StyleSheet.create({
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sizeRow: {
      flexDirection: "row",
      marginLeft: 8,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: !isMobile?"flex-start":"center",
      //paddingBottom: 24,
      gap: 32,
      alignSelf: "center",
      maxWidth: 1200,
      paddingHorizontal: !isMobile?16:0,
    },
    cardWrap: {
     //marginBottom: 16,
    },
    loader: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
  });

  return (
    <View style={[{ flex: 1 }, style]}>
      {/* 
      <View style={styles.topBar}>
        <Text variant='bodyLarge' style={{ color: colors.onSurface, fontWeight: "600" }}>Page size:</Text>
        <View style={styles.sizeRow}>
          {pageSizeOptions.map((opt) => (
            <Button
              key={opt}
              mode={opt === limit ? "contained" : "outlined"}
              onPress={() => onChangeLimit(opt)}
              style={{ marginRight: 8 }}
            >
              {opt}
            </Button>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <Text variant='bodyLarge' style={{ color: colors.onSurfaceVariant, marginRight: 12 }}>{rangeText}</Text>
        <Button mode="outlined" disabled={!canPrev} onPress={goPrev} style={{ marginRight: 8 }}>
          Prev
        </Button>
        <Button mode="outlined" disabled={!canNext} onPress={goNext}>
          Next
        </Button>
      </View>
      */}

      {/* Content */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      ) : err ? (
        <View style={styles.empty}>
          <Text variant='bodyLarge' style={{ color: colors.error, marginBottom: 8 }}>{err}</Text>
          <Button mode="contained" onPress={load}>Retry</Button>
        </View>
      ) : sortedAndFilteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Text variant='bodyLarge' style={{ color: colors.onSurfaceVariant }}>
            {filter === "premarket" ? "No premarkets yet" : 
             filter === "launched" ? "No launched tokens yet" :
             filter === "my_tokens" ? "You haven't joined any premarkets yet" :
             "No premarkets yet"}
          </Text>
        </View>
      ) : (
        <ScrollView
        showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.grid,
            containerWidth ? { width: containerWidth } : null,
          ]}
        >
          {sortedAndFilteredItems.map((it) => {
            const key =
              typeof it.premarketPubkey === "string"
                ? it.premarketPubkey
                : typeof (it as any).premarketPubkey?.toBase58 === "function"
                ? (it as any).premarketPubkey.toBase58()
                : String((it as any).premarketPubkey);
            
            const dynamicInfo = dynamicInfoMap[key];
            const isLoadingDynamic = loadingDynamicInfo[key];
            
            return (
              <View key={key} style={styles.cardWrap}>
                <PremarketCard 
                  mainInfo={it} 
                  dynamicInfo={dynamicInfo}
                  // Show a loading indicator or placeholder when dynamic info is loading
                  {...(isLoadingDynamic && { compact: true })}
                />
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
