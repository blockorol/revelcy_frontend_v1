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

  // Measure the actual grid container width
  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setGridContainerWidth(width);
  }, []);

  // Determine cards per row based on screen width
  const cardsPerRow = useMemo(() => {
    return windowWidth <= 600 ? 1 : 3;
  }, [windowWidth]);

  // Calculate card width and spacing
  // Cards will be positioned: left at left edge, middle at center, right at right edge
  // Spacing between cards (horizontal and vertical) will be uniform
  const { cardWidth, gapSize } = useMemo(() => {
    // Calculate the effective container width
    let effectiveContainerWidth: number;
    if (gridContainerWidth) {
      effectiveContainerWidth = gridContainerWidth;
    } else {
      // Fallback: use containerWidth or window width
      effectiveContainerWidth = containerWidth || windowWidth;
    }
    
    if (cardsPerRow === 1) {
      // Single card: center it with max width constraint
      const maxCardWidth = 368; // PremarketCard's internal max width
      const percentageBasedWidth = effectiveContainerWidth * 0.9;
      const calculatedWidth = Math.min(maxCardWidth, percentageBasedWidth);
      // For single card, use a default gap for vertical spacing
      return { cardWidth: calculatedWidth, gapSize: 16 };
    } else {
      // Three cards: calculate width and spacing to fill container
      // With space-between: left at left edge, right at right edge, middle centered
      // Calculate spacing: (containerWidth - 3 * cardWidth) / 2
      const preferredCardWidth = 368; // Fixed preferred width
      const maxCardWidth = Math.min(preferredCardWidth, effectiveContainerWidth / 3);
      
      // Calculate the gap that space-between will create
      const totalCardWidth = 3 * maxCardWidth;
      const totalGapSpace = effectiveContainerWidth - totalCardWidth;
      const calculatedGap = totalGapSpace / 2; // Two gaps between three cards
      
      // Ensure minimum gap
      const MIN_GAP = 16;
      const finalGap = Math.max(MIN_GAP, calculatedGap);
      
      // If gap is too large, recalculate card width to ensure reasonable spacing
      if (calculatedGap < MIN_GAP) {
        // Recalculate with minimum gap
        const availableForCards = effectiveContainerWidth - (2 * MIN_GAP);
        const scaledCardWidth = Math.max(0, (availableForCards / 3) - 1); // Small safety margin
        return { cardWidth: scaledCardWidth, gapSize: MIN_GAP };
      }
      
      return { cardWidth: maxCardWidth, gapSize: finalGap };
    }
  }, [gridContainerWidth, windowWidth, containerWidth, cardsPerRow]);

  // Create grid style with left alignment for 3 cards, center for 1 card
  // Apply the calculated gap for vertical spacing to match horizontal spacing
  const gridStyle = useMemo(() => ({
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: cardsPerRow === 1 ? "center" as const : "flex-start" as const,
    width: "100%" as const,
    gap: gapSize, // This ensures vertical gaps match horizontal gaps
  }), [cardsPerRow, gapSize]);

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
