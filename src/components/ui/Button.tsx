// ButtonDisplay.tsx
import * as React from "react";
import { View, ViewStyle } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";

type BaseButtonProps = Omit<React.ComponentProps<typeof PaperButton>, "children" | "icon" | "mode">;

export type ButtonVariant = "primary" | "secondary" | "error";
export type ButtonSize = "normal" | "small";
export type ButtonMode = "contained" | "outlined" | "text" | "elevated" | "tonal";

type Props = BaseButtonProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ButtonMode;
  /** текст или узлы */
  children?: React.ReactNode;
  /** иконка слева; можно передать React-элемент или функцию-рендер */
  leftIcon?: React.ReactNode | ((color: string, size: number) => React.ReactNode);
  /** форсируем prominent у текста — по умолчанию true */
  prominentText?: boolean;
};

/** размеры, скругления, иконки, отступы */
const sizeStyles: Record<
  ButtonSize,
  {
    height: number;
    radius: number;
    textVariant: "labelLarge" | "labelMedium";
    /** паддинги, когда ТОЛЬКО текст */
    paddingTextLR: number;
    /** паддинг слева, если есть иконка */
    paddingWithIconLeft: number;
    /** паддинг справа (с иконкой) */
    paddingWithIconRight: number;
    /** размер иконки */
    iconSize: number;
    /** расстояние между иконкой и текстом */
    iconGap: number;
  }
> = {
  normal: {
    height: 40,
    radius: 12,
    textVariant: "labelLarge", // "Revelcy/label/large"
    paddingTextLR: 20,
    paddingWithIconLeft: 20,
    paddingWithIconRight: 20,
    iconSize: 24,
    iconGap: 8,
  },
  small: {
    height: 30,
    radius: 8,
    textVariant: "labelMedium", // "Revelcy/label/medium"
    paddingTextLR: 20,
    paddingWithIconLeft: 12,
    paddingWithIconRight: 20,
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
  prominentText = true,
  disabled,
  onPress,
  ...rest
}: Props) {
  const theme = useTheme();

  // базовые цвета по MD3
  const base =
    variant === "secondary"
      ? { fg: theme.colors.onSecondary, bg: theme.colors.secondary, outline: theme.colors.secondary }
      : variant === "error"
      ? { fg: theme.colors.onError, bg: theme.colors.error, outline: theme.colors.error }
      : { fg: theme.colors.onPrimary, bg: theme.colors.primary, outline: theme.colors.primary };

  const { height, radius, textVariant, paddingTextLR, paddingWithIconLeft, paddingWithIconRight, iconSize, iconGap } =
    sizeStyles[size];

  // цвета от mode
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
      textColor = base.bg;
      borderColor = base.outline;
      break;
    case "text":
      backgroundColor = "transparent";
      textColor = base.bg;
      borderColor = undefined;
      break;
    case "tonal":
      // близко к Paper тональному: фон = secondaryContainer / errorContainer для соответствующих варианта.
      if (variant === "secondary") {
        backgroundColor = theme.colors.secondaryContainer ?? base.bg;
        textColor = theme.colors.onSecondaryContainer ?? theme.colors.onSecondary;
      } else if (variant === "error") {
        backgroundColor = theme.colors.errorContainer ?? base.bg;
        textColor = theme.colors.onErrorContainer ?? theme.colors.onError;
      } else {
        backgroundColor = theme.colors.secondaryContainer ?? base.bg; // часто используют secondaryContainer
        textColor = theme.colors.onSecondaryContainer ?? theme.colors.onSecondary;
      }
      borderColor = undefined;
      break;
  }

  if (disabled) {
    // мягкий дизабл по MD3
    textColor = theme.colors.onSurfaceDisabled;
    backgroundColor = mode === "contained" || mode === "elevated" || mode === "tonal"
      ? theme.colors.surfaceDisabled
      : "transparent";
    borderColor = mode === "outlined" ? theme.colors.outline : undefined;
  }

  const hasIcon = !!leftIcon;

  // contentStyle у Button управляет высотой, внутренними паддингами
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

  // рендер иконки: поддержим и функцию (как у Paper), и элемент
  const renderIcon = () => {
    if (!leftIcon) return null;
    if (typeof leftIcon === "function") {
      return leftIcon(textColor, iconSize);
    }
    // если это React-элемент, попытаемся пробросить size|color
    // (если это ваш SvgIcon, он обычно принимает { size, color })
    // @ts-ignore
    return React.cloneElement(leftIcon as React.ReactElement, {
      // @ts-ignore
      size: (leftIcon as any)?.props?.size ?? iconSize,
      // @ts-ignore
      color: (leftIcon as any)?.props?.color ?? textColor,
    });
  };

  return (
    <PaperButton
      mode={mode as any}
      disabled={disabled}
      onPress={onPress}
      style={[containerStyle, style]}
      contentStyle={contentStyle}
      // убираем стандартные отступы label
      labelStyle={{ marginVertical: 0 }}
      uppercase={false}
      {...rest}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {hasIcon && (
          <View style={{ marginRight: iconGap, marginLeft: 0 }}>{renderIcon()}</View>
        )}
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
