// ChipDisplay.tsx
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Text } from "@components/ui/Text";
import { Chip as PaperChip, useTheme } from "react-native-paper";
import { makeTransparent } from "@utils/colors";

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
  onPress, 
  ...rest
}: Props) {
  const theme = useTheme();

  const baseColor =
    variant === "secondary"
      ? theme.colors.secondary ?? theme.colors.primary
      : variant === "error"
      ? theme.colors.error
      : theme.colors.primary;

  const bgSoft = makeTransparent(baseColor, 0.85);

  const { container, textVariant } = sizeStyles[size];

  const textColor = disabled ? theme.colors.onSurfaceDisabled : baseColor;
  const outlineColor = disabled ? theme.colors.outline : baseColor;
  const backgroundColor = disabled ? theme.colors.surfaceDisabled : bgSoft;
  const noPress = onPress === undefined
  const cursor = noPress?"auto":undefined

  return (
    <PaperChip
      mode={mode}
      selected={false}
      disabled={disabled}
      textStyle={{ margin: 0, padding: 1, cursor: cursor,}}
      style={[
        container,
        {
          backgroundColor,
          borderColor: outlineColor,
          borderWidth: mode === "outlined" ? StyleSheet.hairlineWidth : 0,
          alignItems: "center",
          justifyContent: "center",
          cursor: cursor,
        },
        style,
      ]}
      onPress={onPress}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text
          variant={textVariant}
          style={{ color: textColor, textAlign: "center", cursor: cursor,}}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </PaperChip>
  );
}
