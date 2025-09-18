import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface ExpandableTextProps {
  maxLineExpanded: number;
  text: string;
}

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

  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [truncHeight, setTruncHeight] = useState<number | null>(null);

  useEffect(() => {
    setFullHeight(null);
    setTruncHeight(null);
  }, [text, maxLineExpanded, containerWidth]);

  const needTruncate = useMemo(() => {
    if (fullHeight == null || truncHeight == null) return false;
    return fullHeight > truncHeight + 0.5;
  }, [fullHeight, truncHeight]);

  useEffect(() => {
    if (!needTruncate && expanded) setExpanded(false);
  }, [needTruncate, expanded]);

  const showToggle = needTruncate || expanded;

  return (
    <View
      onLayout={onContainerLayout}
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <Text
        variant="bodyLarge"
        numberOfLines={expanded ? undefined : maxLineExpanded}
        ellipsizeMode="tail"
        style={{ flex: 1, marginRight: 8 }}
      >
        {text}
      </Text>

      {showToggle && (
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
      )}

      {containerWidth != null && (
        <>
          <Text
            variant="bodyLarge"
            style={{
              position: "absolute",
              left: -9999,
              width: containerWidth,
              opacity: 0,
            }}
            onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
          >
            {text}
          </Text>

          <Text
            variant="bodyLarge"
            numberOfLines={maxLineExpanded}
            ellipsizeMode="tail"
            style={{
              position: "absolute",
              left: -9999,
              width: containerWidth,
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
