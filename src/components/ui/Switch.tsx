import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Switch as PaperSwitch, useTheme } from "react-native-paper";
import type { AppTheme } from "@theme/types";

type BaseProps = React.ComponentProps<typeof PaperSwitch>;

type Props = Omit<BaseProps, "theme" | "color"> & {
  style?: ViewStyle;
};

/**
 * 48x28 switch:
 * - Track is drawn by wrapper View:
 *   left  -> primary
 *   right -> surfaceContainerHighest
 * - PaperSwitch track is transparent
 * - Thumb color:
 *   left  -> onPrimary
 *   right -> onSurface
 */
export function Switch({ value, disabled, style, ...rest }: Props) {
  const theme = useTheme<AppTheme>();

  const isOn = value;

  // track (background)
  const trackOn = theme.colors.onPrimary;
  const trackOff = theme.colors.surfaceContainerHighest;

  // thumb (circle)
  const thumbOn = theme.colors.primary;
  const thumbOff = theme.colors.onSurfaceVariant;


  const trackDisabled = theme.colors.surfaceDisabled;
  const thumbDisabled = theme.colors.onSurfaceVariant;
  // ─────────────────────────────────────────────────────────────

  const trackColor = disabled ? trackDisabled : isOn ? trackOn : trackOff;
  const thumbColor = disabled ? thumbDisabled : isOn ? thumbOn : thumbOff;

  return (
    <View style={[styles.track, { backgroundColor: trackColor }, style]}>
      <PaperSwitch
        value={value}
        disabled={disabled}
        // make inner track invisible, wrapper is the track
        trackColor={{ false: "transparent", true: "transparent" }}
        // iOS fallback background (when off)
        ios_backgroundColor="transparent"
        // only thumb should be visible/colored
        thumbColor={thumbColor}
        // keep PaperSwitch inside the 48x28 and clip anything outside
        style={styles.inner}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    overflow: "hidden", // so the thumb stays visually "inside"
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    // This usually centers the native switch well inside 48x28.
    // If you see slight offset on Android/iOS, tweak margin by ±1..2.
    margin: 0,
  },
});
