import React from "react";
import { IconName, SvgIcon } from "@components/base/SvgIcon";
import { Linking, Platform, Pressable, ViewStyle } from "react-native";
import { ExtendedMD3Colors } from "@theme/types";

interface SvgIconButtonProps {
  name: IconName;
  size?: number;
  iconSize?: number;
  colors: ExtendedMD3Colors;
  link: string;
  withoutBackgroud?:boolean
}

export function RoundIconLink({
  name,
  size = 32,
  iconSize = 16,
  colors,
  link,
  withoutBackgroud
}: SvgIconButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const isActive = hovered || pressed || focused;
  const containerStyle: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
    width: size,
    height: size,
    borderWidth: 1,
    borderColor: isActive ? colors.primary : colors.outline,
    backgroundColor: withoutBackgroud
      ? "transparent"
      : isActive
      ? colors.surfaceContainerHighest
      : colors.surfaceVariant,
    borderRadius: size / 2,
  };

  const webHoverProps =
    Platform.OS === "web"
      ? ({
          onHoverIn: () => setHovered(true),
          onHoverOut: () => setHovered(false),
        } as const)
      : {};

  return (
    <Pressable
      onPress={() => Linking.openURL(link)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={containerStyle}
      hitSlop={8}
      {...webHoverProps}
    >
      <SvgIcon name={name} size={iconSize} color={colors.onSurface} />
    </Pressable>
  );
}
