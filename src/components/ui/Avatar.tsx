// components/base/Avatar.tsx
import React, { useState } from "react";
import { View, Image as RNImage } from "react-native";
import { Avatar as PaperAvatar, useTheme } from "react-native-paper";
import type { AppTheme } from "@theme/types";
const WALLET_BUCKET_COUNT = 7;

const defaultAvatars = [
  require("@assets/default_avatars/avatar_0.png"),
  require("@assets/default_avatars/avatar_1.png"),
  require("@assets/default_avatars/avatar_2.png"),
  require("@assets/default_avatars/avatar_3.png"),
  require("@assets/default_avatars/avatar_4.png"),
  require("@assets/default_avatars/avatar_5.png"),
  require("@assets/default_avatars/avatar_6.png"),
] as const;

type Props = {
  /** for fallback */
  walletAddress: string;
  source?: string | null;
  size?: number;
  borderWidth?: number;
  /** set false to disable fallback. default - true*/
  fallbackEnabled?: boolean;
};

export function Avatar({
  walletAddress,
  source,
  size = 48,
  borderWidth = 1,
  fallbackEnabled = true,
}: Props) {
  const { colors } = useTheme() as AppTheme;
  const [avatarFailed, setAvatarFailed] = useState(false);

  const fallbackIndex = walletAddressToNumber(walletAddress);
  const fallbackSource =
    fallbackEnabled && fallbackIndex >= 0 && fallbackIndex < WALLET_BUCKET_COUNT
      ? defaultAvatars[fallbackIndex]
      : null;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor: colors.primary,
    borderWidth,
    overflow: "hidden" as const,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  if (!!!source || avatarFailed) {
    if (fallbackSource) {
      return (
        <RNImage
          source={fallbackSource}
          style={containerStyle}
          resizeMode="cover"
        />
      );
    }
    return <View style={containerStyle} />;
  }

  return (
    <PaperAvatar.Image
      size={size}
      source={{ uri: source }}
      onError={() => setAvatarFailed(true)}
      style={{
        backgroundColor: colors.surfaceVariant,
        borderColor: colors.primary,
        borderWidth,
      }}
    />
  );
}


function walletAddressToNumber(walletAddress: string): number {
  if (!walletAddress) return 0;
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = (hash * 31 + walletAddress.charCodeAt(i)) >>> 0;
  }
  return hash % WALLET_BUCKET_COUNT;
}
