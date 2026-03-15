import { SvgIcon } from "@components/base/SvgIcon";
import { Avatar } from "@components/ui/Avatar";
import { Text } from "@components/ui/Text";
import { searchUsers, UserDto } from "@api/users";
import { ExtendedMD3Colors } from "@theme/types";
import shortString from "@utils/address_shorter";
import { isSolanaPublicKey } from "@utils/solana";
import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

export type WhitelistSearchUser = UserDto;

type WhitelistUserRowProps = {
  walletAddress: string;
  username?: string;
  avatarUrl?: string | null;
  colors: ExtendedMD3Colors;
  trailingIcon: "plus" | "check" | "x-base";
  onPress: () => void;
  disabled?: boolean;
};

export function WhitelistUserRow({
  walletAddress,
  username,
  avatarUrl,
  colors,
  trailingIcon,
  onPress,
  disabled = false,
}: WhitelistUserRowProps) {
  const displayName = username || shortString(walletAddress, 4);
  const shortAddress = shortString(walletAddress, 4);
  const showAddress = !!username;
  const iconColor =
    trailingIcon === "check" ? colors.primary : colors.onSurfaceVariant;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 8,
      }}
    >
      <Avatar
        size={40}
        source={avatarUrl ?? null}
        walletAddress={walletAddress}
      />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="labelLarge" prominent style={{ color: colors.onSurface }}>
          {displayName}
        </Text>
        {showAddress && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {shortAddress}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <SvgIcon
          name={trailingIcon}
          size={trailingIcon === "x-base" ? 16 : 20}
          color={iconColor}
        />
      </TouchableOpacity>
    </View>
  );
}

type WhitelistUserSearchProps = {
  colors: ExtendedMD3Colors;
  onAddUser: (user: WhitelistSearchUser) => boolean;
  isUserAdded: (user: WhitelistSearchUser) => boolean;
  minSearchLength?: number;
  resultLimit?: number;
};

function normalizeUser(item: UserDto): UserDto | null {
  const wallets = Array.isArray(item.wallets)
    ? item.wallets.filter((wallet) => typeof wallet === "string" && wallet.length > 0)
    : [];

  const primaryWallet = wallets[0];
  if (!primaryWallet) return null;

  return {
    id: item.id || primaryWallet,
    username: item.username ?? undefined,
    avatar_url: item.avatar_url ?? undefined,
    wallets,
  };
}

export function WhitelistUserSearch({
  colors,
  onAddUser,
  isUserAdded,
  minSearchLength = 3,
  resultLimit = 5,
}: WhitelistUserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WhitelistSearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= minSearchLength;
  const isExactWallet = isSolanaPublicKey(trimmedQuery);

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let disposed = false;
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          const response = await searchUsers({
            input: trimmedQuery,
            limit: resultLimit,
          });

          if (disposed) return;

          const normalized = response.items
            .map(normalizeUser)
            .filter((item): item is UserDto => item !== null);

          const hasExactWalletMatch = normalized.some((item) =>
            item.wallets.includes(trimmedQuery)
          );

          if (isExactWallet && !hasExactWalletMatch) {
            normalized.unshift({
              id: trimmedQuery,
              username: undefined,
              avatar_url: undefined,
              wallets: [trimmedQuery],
            });
          }

          const uniqueByWallet = new Map<string, UserDto>();
          normalized.forEach((item) => {
            const wallet = item.wallets[0];
            if (!wallet || uniqueByWallet.has(wallet)) return;
            uniqueByWallet.set(wallet, item);
          });

          setResults(Array.from(uniqueByWallet.values()).slice(0, resultLimit));
        } catch (error) {
          if (!disposed) {
            console.warn("[WhitelistUserSearch] failed to search users", error);
            setResults(
              isExactWallet
                ? [
                    {
                      id: trimmedQuery,
                      username: undefined,
                      avatar_url: undefined,
                      wallets: [trimmedQuery],
                    },
                  ]
                : []
            );
          }
        } finally {
          if (!disposed) {
            setIsLoading(false);
          }
        }
      })();
    }, 250);

    return () => {
      disposed = true;
      clearTimeout(timeoutId);
    };
  }, [isExactWallet, resultLimit, shouldSearch, trimmedQuery]);

  const visibleResults = useMemo(() => {
    if (!shouldSearch) return [];
    return results;
  }, [results, shouldSearch]);

  const showPanel = shouldSearch && (visibleResults.length > 0 || isLoading);

  return (
    <View style={{ gap: 8 }}>
      <PaperTextInput
        mode="flat"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by username or wallet"
        autoCapitalize="none"
        autoCorrect={false}
        textColor={colors.onSurface}
        placeholderTextColor={colors.onSurfaceVariant}
        selectionColor={colors.primary}
        underlineColor="transparent"
        activeUnderlineColor={colors.primary}
        style={{
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: 16,
          overflow: "hidden",
        }}
        contentStyle={{
          minHeight: 52,
          paddingHorizontal: 16,
        }}
      />

      {showPanel && (
        <View
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
          }}
        >
          {isLoading && visibleResults.length === 0 ? (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, paddingVertical: 8 }}>
              Searching...
            </Text>
          ) : (
            visibleResults.map((user) => {
              const walletAddress = user.wallets[0];
              const added = isUserAdded(user);

              return (
                <WhitelistUserRow
                  key={walletAddress}
                  walletAddress={walletAddress}
                  username={user.username}
                  avatarUrl={user.avatar_url ?? null}
                  colors={colors}
                  trailingIcon={added ? "check" : "plus"}
                  onPress={() => {
                    if (added) return;
                    const didAdd = onAddUser(user);
                    if (didAdd) {
                      setQuery("");
                      setResults([]);
                    }
                  }}
                  disabled={added}
                />
              );
            })
          )}
        </View>
      )}
    </View>
  );
}
