import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface ExpandableTextProps {
  maxLineExpanded: number;
  text: string;
}

const TOGGLE_AREA_WIDTH = 40;

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLineExpanded,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  const measureWidth =
    containerWidth != null
      ? Math.max(0, containerWidth - TOGGLE_AREA_WIDTH)
      : null;

  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [truncHeight, setTruncHeight] = useState<number | null>(null);

  useEffect(() => {
    setFullHeight(null);
    setTruncHeight(null);
  }, [text, maxLineExpanded, measureWidth]);

  const needTruncate = useMemo(() => {
    if (fullHeight == null || truncHeight == null) return false;
    return fullHeight > truncHeight + 0.5;
  }, [fullHeight, truncHeight]);

  useEffect(() => {
    if (!needTruncate && expanded) setExpanded(false);
  }, [needTruncate, expanded]);

  const showToggle = needTruncate || expanded;

  return (
    <View onLayout={onContainerLayout} style={{ width: "100%" }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        {/* Текст в колонке с паддингом справа под кнопку */}
        <View style={{ flex: 1, paddingRight: TOGGLE_AREA_WIDTH }}>
          <Text
            variant="bodyMedium"
            numberOfLines={expanded ? undefined : maxLineExpanded}
            ellipsizeMode="tail"
            style={{
              color: colors.onSurface,
            }}
          >
            {text}
          </Text>
        </View>

        {/* Фиксированная зона под кнопку — ширина не меняется никогда */}
        <View
          style={{
            width: TOGGLE_AREA_WIDTH,
            alignItems: "flex-end",
          }}
        >
          {showToggle ? (
            <IconButton
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Collapse text" : "Expand text"}
              icon={() => (
                <MaterialCommunityIcons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              )}
              onPress={() => setExpanded((v) => !v)}
            />
          ) : (
            // Плейсхолдер, чтобы макет не “прыгнул”
            <View style={{ width: 40, height: 40 }} />
          )}
        </View>
      </View>

      {/* Невидимые измерители, ширина = контейнер - зона кнопки */}
      {measureWidth != null && (
        <>
          <Text
            variant="bodyMedium"
            style={{
              position: "absolute",
              left: -9999,
              width: measureWidth,
              opacity: 0,
            }}
            onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
          >
            {text}
          </Text>

          <Text
            variant="bodyMedium"
            numberOfLines={maxLineExpanded}
            ellipsizeMode="tail"
            style={{
              position: "absolute",
              left: -9999,
              width: measureWidth,
              opacity: 0,
            }}
            onLayout={(e) => setTruncHeight(e.nativeEvent.layout.height)}
          >
            {text}
          </Text>
        </>
      )}
    </View>
  );
};
