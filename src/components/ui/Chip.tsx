// ChipDisplay.tsx
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import {Text} from '@components/ui/Text'
import { Chip as PaperChip, useTheme } from "react-native-paper";

type BaseChipProps = React.ComponentProps<typeof PaperChip>;

export type ChipVariant = "primary" | "secondary" | "error";
export type ChipSize = "normal" | "small";

type Props = Omit<BaseChipProps, "children"> & {
  /**
   * variant
   */
  variant?: ChipVariant;
  /**
   * size: small (24) or normal (32)
   */
  size?: ChipSize;
  /**
   * text or node inside
   */
  children?: React.ReactNode;
};

function hexToRgba(hex: string, alpha = 1): string {
  const h = hex.replace("#", "");
  if (h.length === 8) {
    const rr = parseInt(h.slice(2, 4), 16);
    const gg = parseInt(h.slice(4, 6), 16);
    const bb = parseInt(h.slice(6, 8), 16);
    return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
  }
  const rr = parseInt(h.slice(0, 2), 16);
  const gg = parseInt(h.slice(2, 4), 16);
  const bb = parseInt(h.slice(4, 6), 16);
  return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
}

const sizeStyles: Record<
  ChipSize,
  { container: ViewStyle; textVariant: "labelLarge" | "labelMedium" }
> = {
  normal: {
    container: {
      height: 32,
      paddingVertical: 4,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    textVariant: "labelLarge",
  },
  small: {
    container: {
      height: 24,
      paddingVertical: 4,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    textVariant: "labelMedium",
  },
};

export function ChipDisplay({
  variant = "primary",
  size = "normal",
  mode = "outlined",
  style,
  children,
  disabled,
  ...rest
}: Props) {
  const theme = useTheme();

  const baseColor =
    variant === "secondary"
      ? theme.colors.secondary ?? theme.colors.primary
      : variant === "error"
      ? theme.colors.error
      : theme.colors.primary;

  const bgSoft = hexToRgba(baseColor, 0.15);

  const { container, textVariant } = sizeStyles[size];

  // Состояние disabled — приглушим цвета
  const textColor = disabled ? theme.colors.onSurfaceDisabled : baseColor;
  const outlineColor = disabled
    ? theme.colors.outline
    : baseColor; // обводка тем же цветом
  const backgroundColor = disabled ? theme.colors.surfaceDisabled : bgSoft;

return (
  <PaperChip
    mode={mode}
    selected={false} // без галочки
    disabled={disabled}
    style={[
      container,
      {
        backgroundColor,
        borderColor: outlineColor,
        borderWidth: mode === "outlined" ? StyleSheet.hairlineWidth : 0,
        alignItems: "center",        // центр по вертикали
        justifyContent: "center",    // центр по горизонтали (для контента внутри)
      },
      style,
    ]}
    {...rest}
  >
    {typeof children === "string" ? (
      <Text
        variant={textVariant}
        style={{ color: textColor, textAlign: "center" }}
      >
        {children}
      </Text>
    ) : (
      children
    )}
  </PaperChip>
);


}

const styles = StyleSheet.create({
  // оставлено для будущих доработок, если понадобятся общие оверрайды
  chipDisplayOverride: {},
});
