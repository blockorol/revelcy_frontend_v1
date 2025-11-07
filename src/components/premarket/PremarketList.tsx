// @components/premarket/PremarketList.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
import { PremarketCard } from "@components/premarket/PremarketCard";
import { getPremarketList, TokenMainInfo, fetchTokenDynamicInfo, TokenDynamicInfo } from "@api/token";
import useIsMobile from "@hooks/useIsMobile";


type PremarketListProps = {
  initialLimit?: number;
  pageSizeOptions?: number[];
  style?: any;
  containerWidth?: number;
};

export const PremarketList: React.FC<PremarketListProps> = ({
  initialLimit = 30,
  pageSizeOptions = [30, 50, 80],
  style,
  containerWidth,
}) => {
  const { colors } = useTheme();
  const isMobile = useIsMobile();

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
      justifyContent: "space-between",
      paddingBottom: 24,
      gap: !isMobile ? 24 : 16,
      maxWidth: 1300,
      alignSelf: "center",
    },
    cardWrap: {
      marginBottom: 16,
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
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant='bodyLarge' style={{ color: colors.onSurfaceVariant }}>No premarkets yet</Text>
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
          {items.map((it) => {
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
