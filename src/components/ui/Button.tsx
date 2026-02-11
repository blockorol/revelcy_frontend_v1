// Button.tsx
import * as React from "react";
import { View, ViewStyle, Platform } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { SvgIcon } from "@components/base/SvgIcon";
import type { IconName } from "@components/base/SvgIcon";
import { ExtendedMD3Colors } from "@theme/types";

type BaseButtonProps = Omit<
  React.ComponentProps<typeof PaperButton>,
  "children" | "icon" | "mode"
>;

export type ButtonVariant = "primary" | "secondary" | "error";
export type ButtonSize = "normal" | "small";
export type ButtonMode = "contained" | "outlined" | "text" | "elevated" | "tonal";
type ButtonState = "enabled" | "hovered" | "focused" | "pressed" | "disabled";

type Props = BaseButtonProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ButtonMode;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode | ((color: string, size: number) => React.ReactNode);
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

type Token =
  | "main"
  | "onMain"
  | "onSurface"
  | "onSurfaceVariant"
  | "outline"
  | "surfaceContainerLow"
  | "surfaceContainerHighest"
  | "transparent";

type VisualRule = {
  bg: Token;
  text: Token;
  border: Token | "none";
};

type RulesByState = Record<ButtonState, VisualRule>;
type RulesByMode = Record<ButtonMode, RulesByState>;

// Filled (contained) — по ТЗ, Tonal = как Filled
const FILLED: RulesByState = {
  enabled: { bg: "main", text: "onMain", border: "none" },
  hovered: { bg: "main", text: "onMain", border: "none" },
  focused: { bg: "main", text: "onMain", border: "none" },
  pressed: { bg: "main", text: "onMain", border: "none" },
  disabled: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
};

// Outlined
const OUTLINED: RulesByState = {
  enabled: { bg: "transparent", text: "onSurface", border: "outline" },
  hovered: { bg: "surfaceContainerHighest", text: "onSurface", border: "main" },
  focused: { bg: "surfaceContainerHighest", text: "onSurface", border: "main" },
  pressed: { bg: "surfaceContainerHighest", text: "onSurface", border: "main" },
  disabled: { bg: "transparent", text: "onSurfaceVariant", border: "outline" },
};

// Text
const TEXT: RulesByState = {
  enabled: { bg: "transparent", text: "onSurface", border: "none" },
  hovered: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  focused: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  pressed: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  disabled: { bg: "transparent", text: "onSurfaceVariant", border: "none" },
};

// Elevated (по ТЗ)
const ELEVATED: RulesByState = {
  enabled: { bg: "transparent", text: "onSurface", border: "none" },
  hovered: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  focused: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  pressed: { bg: "surfaceContainerHighest", text: "onSurface", border: "none" },
  disabled: { bg: "transparent", text: "onSurfaceVariant", border: "none" },
};

const RULES: RulesByMode = {
  contained: FILLED,
  tonal: FILLED, // Tonal = как Filled
  outlined: OUTLINED,
  text: TEXT,
  elevated: ELEVATED,
};

function resolveRule(
  baseRule: VisualRule,
  variant: ButtonVariant,
  state: ButtonState
): VisualRule {
  if (variant === "error" && state === "hovered") {
    return { ...baseRule, bg: "main", text: "onMain" };
  }
  return baseRule;
}

function materialize(
  rule: VisualRule,
  variant: ButtonVariant,
  themeColors: ExtendedMD3Colors
) {
  const main =
    variant === "secondary"
      ? themeColors.secondary
      : variant === "error"
      ? themeColors.error
      : themeColors.primary;

  const onMain =
    variant === "secondary"
      ? themeColors.onSecondary
      : variant === "error"
      ? themeColors.onError
      : themeColors.onPrimary;

  const map = (t: Token): string => {
    switch (t) {
      case "main":
        return main;
      case "onMain":
        return onMain;
      case "onSurface":
        return themeColors.onSurface;
      case "onSurfaceVariant":
        return themeColors.onSurfaceVariant;
      case "outline":
        return themeColors.outline;
      case "surfaceContainerLow":
        return themeColors.surfaceContainerLow;
      case "surfaceContainerHighest":
        return themeColors.surfaceContainerHighest;
      case "transparent":
      default:
        return "transparent";
    }
  };

  return {
    backgroundColor: map(rule.bg),
    textColor: map(rule.text),
    borderColor: rule.border === "none" ? undefined : map(rule.border as Token),
    hasBorder: rule.border !== "none",
    main: main,
  };
}

export function Button({
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

  const [hovered, setHovered] = React.useState(false);   // web only
  const [pressed, setPressed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const state: ButtonState = disabled
    ? "disabled"
    : pressed
    ? "pressed"
    : focused
    ? "focused"
    : hovered
    ? "hovered"
    : "enabled";

  const rule = resolveRule(RULES[mode][state], variant, state);
  const { backgroundColor, textColor, borderColor, hasBorder, main } = materialize(
    rule,
    variant,
    theme.colors as ExtendedMD3Colors
  );

  const {
    height,
    radius,
    textVariant,
    paddingTextLR,
    paddingWithIconLeft,
    paddingWithIconRight,
    iconSize,
    iconGap
  } = sizeStyles[size];

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
    borderWidth: hasBorder ? 1 : 0,
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

  const webHoverProps =
    Platform.OS === "web"
      ? ({
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
        } as any)
      : {};

  const convertedMode = mode === 'tonal' ? 'contained-tonal' : mode

  return (
    <PaperButton
      mode={convertedMode}
      disabled={disabled}
      onPress={onPress}
      style={[containerStyle, style]}
      contentStyle={contentStyle}
      labelStyle={{ 
        lineHeight: 0,
        marginHorizontal: 0, marginVertical: 0}}
      uppercase={false}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      textColor={main}
      {...webHoverProps}
      {...rest}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {!!(leftIcon || leftSvgIconName) && (
          <View style={{ marginRight: children ? iconGap:0 }}>{renderIcon()}</View>
        )}
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            variant={textVariant}
            prominent={prominentText}
            style={{ color: textColor, textAlign: "center" }}
            numberOfLines={1}
          >
            {String(children)}
          </Text>
        ) : (
          children
        )}
      </View>
    </PaperButton>
  );
}
