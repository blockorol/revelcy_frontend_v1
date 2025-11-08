import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { formatDistanceToNow } from "date-fns";
import { SvgIcon } from "@components/base/SvgIcon";
import { Avatar } from "@components/ui/Avatar";
import { AppTheme } from "@theme/types";
import { useUserModal } from "@storage/UserModalContext";

export interface UserCardProps {
  baseInfo: {
    userId: string;
    username?: string;
    walletAddress: string;
    avatarUrl: string | null;
  };
  tokenInfo: {
    userJoined: number; // timestamp
    amount: number; // SOL
    amountProcent: number; // %
    isCreator?: boolean;
  };
  stats?: Stats;
}
export interface Stats {
  humanity?: StatsHumanity;
  balance?: number;
  pumpFun?: StatsPumpFun;
}
export interface StatsPumpFun {
  followers?: number;
  createdTokens?: number;
  trades?: number;
}

export type StatsHumanity = "bot" | "likely human" | "human";

export const UserCard: React.FC<UserCardProps> = ({
  baseInfo,
  tokenInfo,
  stats,
}) => {
  const { colors } = useTheme() as AppTheme;
  const { openUserModal } = useUserModal();
  const joinedAgo = formatDistanceToNow(tokenInfo.userJoined, {
    addSuffix: false,
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLow,
          ...(tokenInfo.isCreator && {
            borderWidth: 0.1,
            borderColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 10,
          }),
        },
      ]}
    >
      {/* Header row */}
      <Pressable
        onPress={() =>
          openUserModal({
            userId: baseInfo.userId,
            username: baseInfo.username ?? baseInfo.walletAddress,
            walletAddress: baseInfo.walletAddress,
            avatarUrl: baseInfo.avatarUrl,
          })
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Avatar
            size={48}
            source={baseInfo.avatarUrl}
            walletAddress={baseInfo.walletAddress}
          />
          <View style={{ flex: 1, gap: 6, flexDirection: "column" }}>
            {baseInfo.username && (
              <Text variant="labelLarge" style={{ color: colors.onSurface }}>
                {baseInfo.username}
              </Text>
            )}
            {tokenInfo.isCreator ? (
              <View style={styles.creator}>
                <Text variant="labelMedium" style={{ color: colors.primary }}>
                  Creator
                </Text>
              </View>
            ) : (
              <Text
                variant="labelMedium"
                style={{ color: colors.onSurfaceVariant, opacity: 0.8 }}
              >
                {joinedAgo} ago
              </Text>
            )}
          </View>

          <View style={{ alignItems: "flex-end", gap: 4, paddingVertical: 4 }}>
            <Text
              variant="labelLarge"
              style={{ color: colors.onSurface, fontWeight: 700 }}
            >
              {tokenInfo.amount.toFixed(1)} SOL
            </Text>
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant, fontWeight: 700 }}
            >
              {tokenInfo.amountProcent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {stats && (
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* Joined and humanity */}
            <JoinedAndHumanity {...stats} />
          </View>
        )}
      </Pressable>
    </View>
  );
};

export function JoinedAndHumanity({ humanity, balance, pumpFun }: Stats) {
  const { colors } = useTheme();
  const humanityColor = humanity === "bot" ? colors.error : colors.primary;
  const humanityLabel =
    humanity === "bot"
      ? "Likely a bot"
      : humanity === "human"
      ? "Human"
      : "Likely human";

  return (
    <View>
      {(balance || humanity) && (
        <View style={styles.row}>
          <SvgIcon
            name="wallet-outlined"
            size={20}
            color={colors.onSurface}
            style={{ paddingRight: 4 }}
          />
          {humanity && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text variant="labelMedium" style={{ color: humanityColor }}>
                {humanityLabel}
              </Text>
              <SvgIcon
                name={humanity === "bot" ? "robot-outlined" : "smile-outlined"}
                size={20}
                color={humanityColor}
              />
            </View>
          )}
          {balance && (
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant }}
            >
              Balance{" "}
              <Text
                variant="labelMedium"
                style={{ color: colors.onSurface, fontWeight: 700 }}
              >
                ${balance}
              </Text>
            </Text>
          )}
        </View>
      )}

      {/* PumpFun Stats */}
      {pumpFun && (
        <View style={styles.row}>
          <SvgIcon
            name="pumpfun"
            size={20}
            color={colors.onSurface}
            style={{ paddingRight: 4 }}
          />
          {pumpFun.followers && (
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant }}
            >
              Followers{" "}
              <Text
                variant="labelMedium"
                style={{ color: colors.onSurface, fontWeight: 700 }}
              >
                {pumpFun.followers}
              </Text>
            </Text>
          )}

          {pumpFun.createdTokens && (
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant }}
            >
              Created{" "}
              <Text
                variant="labelMedium"
                style={{ color: colors.onSurface, fontWeight: 700 }}
              >
                {pumpFun.createdTokens}
              </Text>
            </Text>
          )}
          {pumpFun.trades && (
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant }}
            >
              Traded{" "}
              <Text
                variant="labelMedium"
                style={{ color: colors.onSurface, fontWeight: 700 }}
              >
                {pumpFun.trades}
              </Text>
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    margin: 0,
    width: 365,
    gap: 24,
    flexDirection: "column",
  },
  creator: {
    width: 71,
    height: 20,
    backgroundColor: "rgba(0, 255, 119, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    height: 20,
    marginBottom: 4,
  },
});
