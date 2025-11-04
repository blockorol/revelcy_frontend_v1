// @components/premarket/PremarketList.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, useWindowDimensions, LayoutChangeEvent } from "react-native";
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
  const { width: windowWidth } = useWindowDimensions();

  const [cursor, setCursor] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [items, setItems] = useState<TokenMainInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dynamicInfoMap, setDynamicInfoMap] = useState<Record<string, TokenDynamicInfo>>({});
  const [loadingDynamicInfo, setLoadingDynamicInfo] = useState<Record<string, boolean>>({});
  const [gridContainerWidth, setGridContainerWidth] = useState<number | null>(null);

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

  // Calculate responsive gap based on screen width
  // Gap will be 2% of screen width, with min 16 and max 40
  const responsiveGap = useMemo(() => {
    const calculatedGap = windowWidth * 0.02;
    return Math.max(16, Math.min(40, calculatedGap));
  }, [windowWidth]);

  // Measure the actual grid container width
  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setGridContainerWidth(width);
  }, []);

  // Calculate card width based on screen size
  // Screen width <= 800px: 1 card per row
  // Screen width > 800px: 3 cards per row
  // Ensures card never exceeds container boundaries
  const cardWidth = useMemo(() => {
    // Determine cards per row based on screen width
    const cardsPerRow = windowWidth <= 600 ? 1 : 3;
    
    // Calculate the effective container width
    let effectiveContainerWidth: number;
    if (gridContainerWidth) {
      // gridContainerWidth is the measured width of the View with padding
      // The View has padding: responsiveGap, so the content area is smaller
      // Content width = measured width - 2*padding (left + right)
      effectiveContainerWidth = gridContainerWidth - (2 * responsiveGap);
    } else {
      // Fallback: use window width or containerWidth, accounting for maxWidth constraint
      const maxAvailableWidth = Math.min(windowWidth, containerWidth || 1300);
      // Account for the grid container's padding
      effectiveContainerWidth = maxAvailableWidth - (2 * responsiveGap);
    }
    
    // Calculate spacing needed for gaps between cards (not padding, which is already accounted for)
    // For 1 card: no gaps needed
    // For 3 cards: 2 gaps between the 3 cards
    const gapSpacing = cardsPerRow > 1 ? ((cardsPerRow - 1) * responsiveGap) : 0;
    
    // Available width for cards = container content width - gaps between cards
    const availableWidth = effectiveContainerWidth - gapSpacing;
    
    // Ensure availableWidth is never negative
    const safeAvailableWidth = Math.max(0, availableWidth);
    const calculatedWidth = safeAvailableWidth / cardsPerRow;
    
    // Add a small safety margin (1px) to prevent any rounding/overflow issues
    const finalWidth = Math.max(0, calculatedWidth - 1);
    
    // Ensure the card width never exceeds the safe available width per card
    const maxAllowedWidth = Math.max(0, (effectiveContainerWidth - gapSpacing) / cardsPerRow - 1);
    
    return Math.min(finalWidth, maxAllowedWidth);
  }, [gridContainerWidth, windowWidth, responsiveGap, containerWidth]);

  // Create dynamic grid style with responsive gap
  // flexWrap: "wrap" allows wrapping after the calculated number of cards per row
  const gridStyle = useMemo(() => ({
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "flex-start" as const,
    gap: responsiveGap,
    padding: responsiveGap,
    maxWidth: 1300,
    alignSelf: "center" as const,
  }), [responsiveGap]);

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
    cardWrap: {
      // Remove marginBottom since gap handles spacing
      flexShrink: 0,
      flexGrow: 0,
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
          contentContainerStyle={containerWidth ? { width: containerWidth } : undefined}
        >
          <View onLayout={onGridLayout} style={gridStyle}>
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
              <View key={key} style={[styles.cardWrap, { width: cardWidth }]}>
                <PremarketCard 
                  mainInfo={it} 
                  dynamicInfo={dynamicInfo}
                  width={cardWidth}
                  // Show a loading indicator or placeholder when dynamic info is loading
                  {...(isLoadingDynamic && { compact: true })}
                />
              </View>
            );
          })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
