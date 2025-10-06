// ButtonDisplay.tsx
import * as React from "react";
import { View, ViewStyle } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { SvgIcon } from "@components/base/SvgIcon";
import type { IconName } from "@components/base/SvgIcon";

type BaseButtonProps = Omit<
  React.ComponentProps<typeof PaperButton>,
  "children" | "icon" | "mode"
>;

export type ButtonVariant = "primary" | "secondary" | "error";
export type ButtonSize = "normal" | "small";
export type ButtonMode = "contained" | "outlined" | "text" | "elevated" | "tonal";

type Props = BaseButtonProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ButtonMode;
  children?: React.ReactNode;

  // paper icon
  leftIcon?: React.ReactNode | ((color: string, size: number) => React.ReactNode);
  // custon svgIcon
  leftSvgIconName?: IconName;

  prominentText?: boolean;
};

const sizeStyles: Record<
  ButtonSize,
  {
    height: number;
    radius: number;
    textVariant: "labelLarge" | "labelMedium";
    paddingTextLR: number;
    paddingWithIconLeft: number;
    paddingWithIconRight: number;
    iconSize: number;
    iconGap: number;
  }
> = {
  normal: {
    height: 40,
    radius: 12,
    textVariant: "labelLarge",
    paddingTextLR: 20,
    paddingWithIconLeft: 20,
    paddingWithIconRight: 20,
    iconSize: 24,
    iconGap: 8,
  },
  small: {
    height: 30,
    radius: 8,
    textVariant: "labelMedium",
    paddingTextLR: 16,
    paddingWithIconLeft: 12,
    paddingWithIconRight: 16,
    iconSize: 16,
    iconGap: 4,
  },
};

export function ButtonDisplay({
  variant = "primary",
  size = "normal",
  mode = "contained",
  style,
  children,
  leftIcon,
  leftSvgIconName,
  prominentText = true,
  disabled,
  onPress,
  ...rest
}: Props) {
  const theme = useTheme();

  const base =
    variant === "secondary"
      ? { fg: theme.colors.onSecondary, bg: theme.colors.secondary, outline: theme.colors.secondary }
      : variant === "error"
      ? { fg: theme.colors.onError, bg: theme.colors.error, outline: theme.colors.error }
      : { fg: theme.colors.onPrimary, bg: theme.colors.primary, outline: theme.colors.primary };

  const {
    height,
    radius,
    textVariant,
    paddingTextLR,
    paddingWithIconLeft,
    paddingWithIconRight,
    iconSize,
    iconGap,
  } = sizeStyles[size];

  let backgroundColor: string | undefined;
  let borderColor: string | undefined;
  let textColor: string;

  switch (mode) {
    case "contained":
    case "elevated":
      backgroundColor = base.bg;
      textColor = base.fg;
      borderColor = undefined;
      break;
    case "outlined":
      backgroundColor = "transparent";
      textColor = theme.colors.onSurface;
      borderColor = base.outline;
      break;
    case "text":
      backgroundColor = "transparent";
      textColor = theme.colors.onSurfaceVariant;
      borderColor = undefined;
      break;
    case "tonal":
      backgroundColor = theme.colors.secondary;
      textColor = theme.colors.onSecondary;
      borderColor = undefined;
      break;
  }

  if (disabled) {
    textColor = theme.colors.onSurfaceDisabled;
    backgroundColor =
      mode === "contained" || mode === "elevated" || mode === "tonal"
        ? theme.colors.surfaceDisabled
        : "transparent";
    borderColor = mode === "outlined" ? theme.colors.outline : undefined;
  }

  const hasIcon = !!leftIcon || !!leftSvgIconName;

  const contentStyle: ViewStyle = {
    height,
    minHeight: height,
    paddingLeft: hasIcon ? paddingWithIconLeft : paddingTextLR,
    paddingRight: hasIcon ? paddingWithIconRight : paddingTextLR,
  };

  const containerStyle: ViewStyle = {
    borderRadius: radius,
    backgroundColor,
    borderColor,
    borderWidth: mode === "outlined" ? 1 : 0,
    overflow: "hidden",
  };

  const renderIcon = () => {
    if (leftIcon) {
      if (typeof leftIcon === "function") {
        return leftIcon(textColor, iconSize);
      }
      // @ts-ignore
      return React.cloneElement(leftIcon as React.ReactElement, {
        // @ts-ignore
        size: (leftIcon as any)?.props?.size ?? iconSize,
        // @ts-ignore
        color: (leftIcon as any)?.props?.color ?? textColor,
      });
    }
    if (leftSvgIconName) {
      return <SvgIcon name={leftSvgIconName} size={iconSize} color={textColor} />;
    }
    return null;
  };

  return (
    <PaperButton
      mode={mode as any}
      disabled={disabled}
      onPress={onPress}
      style={[containerStyle, style]}
      contentStyle={contentStyle}
      labelStyle={{ marginHorizontal: 0, marginVertical: 0}}
      uppercase={false}
      {...rest}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {hasIcon && <View style={{ marginRight: iconGap }}>{renderIcon()}</View>}
        {typeof children === "string" ? (
          <Text
            variant={textVariant}
            prominent={prominentText}
            style={{ color: textColor, textAlign: "center" }}
            numberOfLines={1}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </PaperButton>
  );
}
