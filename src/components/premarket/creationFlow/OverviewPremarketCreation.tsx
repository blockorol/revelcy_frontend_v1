// components/token/TokenOverviewCreation.tsx
import React, { useMemo, useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { useTheme, ActivityIndicator, Divider } from "react-native-paper";
import { Button } from "@components/ui/Button";
import { Text } from "@components/ui/Text";
import { format } from "date-fns";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { useWallet } from "@storage/wallet-adapter";
import { IconName, SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { TokenCreateFullData } from "@components/token/create/interface";
import { ExtendedMD3Colors } from "@theme/types";
import { PremarketBondingCurve } from "@components/premarket/PremarketBondingCurve";
import { useAuth } from "@providers/AuthContext";
import {
  convertSmallCountToLamport,
  convertSolToPercentOnStart,
  DEFAULT_TOKEN_COUNT,
} from "@utils/premarket";
import LoginButton from "@components/login/LoginButton";
import { DonutWithLegend } from "@components/base/DonutWithLegend";
import { round } from "@utils/numbers";

type validationError = "user" | "connection" | "wrong connection" | "no data";

type Props = {
  data: TokenCreateFullData;
  onLaunch: () => void;
  launchState: string | undefined;
  onClose?: () => void;
  onBack?: () => void;
};
export default function OverviewPremarketCreation({
  data,
  onLaunch,
  launchState,
  onClose,
  onBack,
}: Props) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const { isMobile, width } = useIsMobileWithDemention();
  const { publicKey, connected, connect, disconnect } = useWallet();
  const { user, logout } = useAuth();
  const solanaFee = 0.02;
  const errorMapper = {
    user: {
      text: "User not login",
      button: <LoginButton />,
    },
    connection: {
      text: "Wallet is not connected",
      button: (
        <Button onPress={connect} variant="primary" size="normal">
          Connect
        </Button>
      ),
    },
    "wrong connection": {
      text: "Wallet and loing have different address, please reconnect",
      button: (
        <View>
          <Button onPress={disconnect} variant="primary" size="normal">
            Disconned
          </Button>
          <Button
            onPress={logout}
            variant="primary"
            mode="outlined"
            size="normal"
          >
            Log out
          </Button>
        </View>
      ),
    },
    "no data": {
      text: "Please fill data before launch",
      button: (
        <Button onPress={onBack} variant="primary" size="normal">
          Go back
        </Button>
      ),
    },
  };

  const error = useMemo(() => {
    if (!user) {
      return errorMapper["user"];
    }
    if (!connected || !publicKey) {
      return errorMapper["connection"];
    }
    if (publicKey.toString() !== user.userId) {
      return errorMapper["wrong connection"];
    }
    if (!data) {
      return errorMapper["no data"];
    }
    return undefined;
  }, [connected, publicKey, user]);

  const shortAddress = useMemo(() => {
    if (!connected || !publicKey) {
      return "";
    }
    const s = publicKey.toString();
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  }, [connected, publicKey]);

  if (!data) {
    return (
      <View
        style={{ padding: 24, alignItems: "center", justifyContent: "center" }}
      >
        <Text variant="bodyLarge">Loading...</Text>
      </View>
    );
  }
  const percent = convertSolToPercentOnStart(data.tokenomicsData.creatorInitialBuy)

  const { tokenName, tokenTicker, description, avatar, links } =
    data.mainData || {};
  const { customData } = data;

  // custom links
  const customLinks = customData?.links ?? [];

  // banner
  const bannerSrc =
    customData?.banner?.url ??
    (customData?.banner?.data ? { uri: customData.banner.data } : undefined);

  // description
  const descriptionCommunity = customData?.description;

  // premaket data
  const prem = data.premarket;

  const deadlineText = prem?.deadline
    ? format(new Date(prem.deadline * 1000), "dd.MM.yyyy HH:mm (XXX)")
    : undefined;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: isMobile ? 0 : 16,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          justifyContent: "flex-start",
          alignItems: "stretch",
          width: "100%",
          paddingHorizontal: 16,
          paddingVertical: 40,
        }}
      >
        {launchState && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 9999,
              backgroundColor: theme.colors.shadow,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surfaceContainerHighest,
                gap: 20,
                padding: 16,
                borderRadius: 16,
              }}
            >
              <Text variant="titleMedium"> {launchState}</Text>
              <ActivityIndicator
                animating
                color={theme.colors.primary}
                size="large"
              />
            </View>
          </View>
        )}

        <TokenCreateFormHeader
          title="Overview"
          theme={theme}
          onClose={onClose}
        />

        <View
          // sections big
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            gap: 56,
            paddingTop: 32,
            paddingVertical: 16,
          }}
        >
          <View
            // sections token info
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              gap: 16,
            }}
          >
            {/* avatar + name/ticker + socials */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: colors.surfaceVariant,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Text
                    variant="headlineMedium"
                    style={{ color: colors.onSurface }}
                  >
                    +
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ color: colors.onSurface }}>
                  {tokenName || "Unnamed"}
                </Text>
                <Text
                  variant="labelLarge"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {tokenTicker || "—"}
                </Text>
              </View>

              {/* quick socials icons */}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                {links?.twitter ? (
                  <SvgIcon name="x-logo" size={22} color={colors.onSurface} />
                ) : null}
                {links?.website ? (
                  <SvgIcon
                    name="world-outlined"
                    size={22}
                    color={colors.onSurface}
                  />
                ) : null}
                {links?.telegram ? (
                  <SvgIcon name="tg-logo" size={22} color={colors.onSurface} />
                ) : null}
              </View>
            </View>

            {/* Description */}
            {description ? (
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurfaceVariant }}
              >
                {description}
              </Text>
            ) : null}
            {/* Links detail (main + custom) */}
            {(links?.twitter || links?.telegram || links?.website) && (
              <View style={{ gap: 8 }}>
                {links?.twitter && (
                  <RowLine
                    icon="x-logo"
                    label="Twitter / X"
                    value={links.twitter}
                  />
                )}
                {links?.website && (
                  <RowLine
                    icon="world-outlined"
                    label="Website"
                    value={links.website}
                  />
                )}
                {links?.telegram && (
                  <RowLine
                    icon="tg-logo"
                    label="Telegram"
                    value={links.telegram}
                  />
                )}
              </View>
            )}
          </View>

          <View
            // Premarket info
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              gap: 16,
            }}
          >
            <Text
              variant="labelLarge"
              prominent
              style={{ color: colors.onSurface }}
            >
              Premarket Goal
            </Text>
            {deadlineText && (
              <View style={{ gap: 4, flexDirection: "row" }}>
                <Text
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Deadline
                </Text>
                <Text
                  variant="labelMedium"
                  prominent
                  style={{ color: colors.onSurface }}
                >
                  {deadlineText}
                </Text>
              </View>
            )}
            <PremarketBondingCurve
              currentUserId={user?.userId ?? "dummy_id"}
              width={isMobile ? width - 16 * 2 : 448}
              height={292}
              state="premarket"
              goalPercent={prem?.goal_percent ?? 0}
              nowPercent={
                (100 * data.tokenomicsData.creatorInitialBuy) /
                DEFAULT_TOKEN_COUNT
              }
              joiners={[
                {
                  id: user?.userId ?? "dummy_id",
                  user_url: user?.avatarUrl ?? undefined,
                  amount_sol_lamp: convertSmallCountToLamport(
                    data.tokenomicsData.creatorInitialBuy
                  ),
                  amount_sol_cumulative_lamp: convertSmallCountToLamport(
                    data.tokenomicsData.creatorInitialBuy
                  ),
                },
              ]}
              background={colors.surfaceContainerLow}
            />
          </View>

          <View
            // sections community
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              gap: 16,
            }}
          >
            <Text
              variant="labelLarge"
              prominent
              style={{ color: colors.onSurface }}
            >
              About Community
            </Text>

            {/* Banner */}
            {bannerSrc && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 3,
                  borderRadius: 20,
                  overflow: "hidden",
                  backgroundColor: colors.surfaceContainerLowest,
                }}
              >
                <Image
                  source={
                    typeof bannerSrc === "string"
                      ? { uri: bannerSrc }
                      : (bannerSrc as any)
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    // @ts-ignore
                    objectFit: "cover",
                    // @ts-ignore
                    objectPosition: "center",
                  }}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Description */}
            {descriptionCommunity ? (
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurfaceVariant }}
              >
                {descriptionCommunity}
              </Text>
            ) : null}

            {/* Links detail (main + custom) */}
            {customLinks.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ gap: 16, width: isMobile ? width - 16 * 2 : 448 }}
              >
                <View style={{ flexDirection: "row", gap: 16 }}>
                  {customLinks.map((l, i) => (
                    <Button
                      key={`commbtn-${l.text}`}
                      size="small"
                      variant="primary"
                      mode="outlined"
                      leftSvgIconName={
                        l.type === "x"
                          ? "x-logo"
                          : l.type === "tg"
                          ? "tg-logo"
                          : "world-outlined"
                      }
                      onPress={() => open(l.url)}
                    >
                      {l.text}
                    </Button>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Tokenomics */}
          <View
            // sections Tokenomics
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              gap: 16,
            }}
          >
            <Text
              variant="labelLarge"
              prominent
              style={{ color: colors.onSurface }}
            >
              Tokenomics
            </Text>

            {/* todo: add circle */}
            <DonutWithLegend 
            slices={[
                {value:round(percent, 1), additional: data.tokenomicsData.creatorInitialBuy.toFixed(2), label:"Creator (You)", color: theme.colors.primary},
                {value:20, label:"Pumpswap pool", color: theme.colors.secondary},
                {value:round(80-percent, 1), label:"Bonding curve", color: theme.colors.onSurface},
            ]}
            />
            
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Solana fees
                </Text>
                <Text
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {solanaFee.toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Revelcy fees
                  <Text
                    variant="labelMedium"
                    style={{ color: colors.inverseOnSurface }}
                  >
                    {" "}
                    1% of creator buy
                  </Text>
                </Text>
                <Text
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {(data.tokenomicsData.creatorInitialBuy / 100).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Divider />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                  Cost
                </Text>
                <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                  {(
                    data.tokenomicsData.creatorInitialBuy +
                    solanaFee +
                    data.tokenomicsData.creatorInitialBuy / 100
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
            

            {/* todo: availble amount */}
            {/* <RowLine
              icon="wallet-outlined"
              label="Creator initial buy"
              value={`${userSolana} SOL Available`}
            /> */}
          </View>

          {!!error && (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <SvgIcon name="info-circle" color={colors.error} size={24} />
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurfaceVariant }}
              >
                {error.text}
              </Text>
            </View>
          )}

          {/* Launch CTA */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent:'space-between',
              alignItems: "center",
              gap: 16,
            }}
          >
          {onBack&&<SvgIconButton name='caret-left' size={32} onPress={onBack} color={colors.onSurface}/>}
            {!error ? (
              <Button mode="contained" onPress={onLaunch}>
                {`Start premarket with ${shortAddress}`}
              </Button>
            ) : (
              error.button
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/** Small row with icon +  value */
function RowLine({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value?: string;
}) {
  const { colors } = useTheme();
  if (!value) return null;

  const formatedValue = value.startsWith("https://")
    ? value.slice(8)
    : value.startsWith("http://")
    ? value.slice(7)
    : value;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
      }}
    >
      <SvgIcon name={icon} size={24} color={colors.onSurface} />
      <Text
        variant="bodyMedium"
        style={{ color: colors.onSurfaceVariant, maxWidth: "60%" }}
      >
        {formatedValue}
      </Text>
    </View>
  );
}
