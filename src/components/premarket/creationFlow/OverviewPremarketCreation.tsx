// components/token/TokenOverviewCreation.tsx
import { useMemo, useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { useTheme, Divider, HelperText } from "react-native-paper";
import { Button } from "@components/ui/Button";
import { Text } from "@components/ui/Text";
import { format } from "date-fns";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { useWallet } from "@storage/wallet-adapter";
import { IconName, SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { TokenCreateFullData, WhitelistData } from "@components/token/create/interface";
import { ExtendedMD3Colors } from "@theme/types";
import { PremarketBondingCurve } from "@components/premarket/PremarketBondingCurve";
import { useAuth } from "@providers/AuthContext";
import { convertDecimalToToken, convertSmallCountToLamport, formatNumberCompact } from "@utils/premarket";
import LoginButton from "@components/login/LoginButton";
import { DonutWithLegend } from "@components/base/DonutWithLegend";
import { round, formatNumberNoTrailingZeros } from "@utils/numbers";
import { convertSolToPercentOnStart } from "@services/pumpfun/adds";
import { convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";
import { COMMUNITY_BANNER_ASPECT_RATIO } from "@utils/aspectRatios";
import { Switch } from "@components/ui/Switch";
import { getTokenShortLink } from "@utils/shortLink";
import { VestingData } from "@components/token/create/VestingSetupForm";

type Props = {
  data: TokenCreateFullData;
  whitelistData?: WhitelistData;
  vestingData?: VestingData;
  onLaunch: (discoverable: boolean) => void;
  onCreateConcept: (discoverable: boolean) => void;
  launchState: string | undefined;
  removeAll: () => void;
  onClose?: () => void;
  onBack?: () => void;
};
// const PUMP_FEE_PERCENTAGE = 0.015;
// const REVELCY_FEE_PERCENTAGE = 0.01;
const SOL_LOCK = 0.06918;
export default function OverviewPremarketCreation({
  data,
  whitelistData,
  vestingData,
  onLaunch,
  onCreateConcept,
  launchState,
  removeAll,
  onClose,
  onBack,
}: Props) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const { isMobile, width,height } = useIsMobileWithDemention();
  const { publicKey, connected, connect, disconnect } = useWallet();
  const { user, logout } = useAuth();
  
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const onChangeDiscoverable = () => setIsDiscoverable(!isDiscoverable);

  const errorMapper = {
    user: {
      text: "Please login",
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
      text: "Wallet and current user have different address, please reconnect or relogin",
      button: (
        <View style={{ flexDirection: "row", padding: 8, gap: 10 }}>
          <Button onPress={disconnect} variant="primary" size="normal">
            Disconnect
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
    "launch in progress": {
      text: "Launch in progess,  keep calm and sign with wallet",
      button: (
        <Button onPress={()=>{}} disabled={true} variant="primary" size="normal">
          Launching...
        </Button>
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
    if (publicKey.toString() !== user.walletAddress) {
      return errorMapper["wrong connection"];
    }
    if (!data) {
      return errorMapper["no data"];
    }
    if (launchState !== undefined) {
      return errorMapper["launch in progress"];
    }
    return undefined;
  }, [launchState, connected, publicKey, user]);

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
        <Button variant='primary' mode='outlined' onPress={removeAll}>Remove all info</Button>
      </View>
    );
  }
  const goalSol =data.premarket.goal_sol;
  const percentGoal = convertSolToPercentOnStart(goalSol);

  const { tokenName, tokenTicker, description, avatar, links } =
    data.mainData || {};
  const { customData } = data;

  // custom links
  const customLinks = customData?.links ?? [];

  // banner
  const bannerSrc =
    customData?.banner?.url ??
    (customData?.banner?.data ? { uri: customData.banner.data } : undefined);

  // description (with legacy fallback for older drafts)
  const descriptionCommunity = (
    customData?.description ?? (customData as { communityDescription?: string } | undefined)?.communityDescription ?? ""
  ).trim();
  const hasAboutCommunity = !!bannerSrc || !!descriptionCommunity || customLinks.length > 0;

  const deadlineText = data.premarket?.deadline_sec
    ? format(new Date(data.premarket.deadline_sec * 1000), "dd.MM.yyyy HH:mm (XXX)")
    : undefined;
  const whitelistEnabled = whitelistData?.state === "enabled";
  const whitelistCount = whitelistData?.items?.length ?? 0;
  const vestingEnabled = !!vestingData?.enabled;
  const shortLinkValue = data.premarket.short_link_name
    ? getTokenShortLink(data.premarket.short_link_name)
    : undefined;
  const vestingSubtitle = vestingEnabled
    ? `${vestingData?.unlockAtLaunchPercent ?? 0}% unlock, ${formatVestingPeriod(
        vestingData?.vestingPeriodSec ?? 0
      )}`
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
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: isMobile ? 40 : 24,
          maxWidth: 500,
          minHeight: isMobile ? height: height * 0.9,
        }}
      >

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
              width={isMobile ? width - 16 * 2 : 432}
              height={292}
              state="premarket"
              goalSol={convertSmallCountToLamport(data.premarket.goal_sol)}
              nowSol={convertSmallCountToLamport(data.tokenomicsData.creatorInitialBuy)}
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
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              gap: 24,
            }}
          >
            <Text
              variant="labelLarge"
              prominent
              style={{ color: colors.onSurface }}
            >
              Features
            </Text>

            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 12,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMedium" selectionColor={colors.onSurface}>
                Make premarket discoverable
              </Text>
              <Switch value={isDiscoverable} onValueChange={onChangeDiscoverable} />
              
            </View>

            <View style={{ gap: 24 }}>
              <FeatureItem
                icon="two-coins"
                title="Vesting"
                subTitle={vestingSubtitle}
                status={vestingEnabled ? "active" : "inactive"}
              />
              <FeatureItem
                icon="users"
                title="Whitelist"
                subTitle={`${whitelistCount} ${whitelistCount === 1 ? "user" : "users"}`}
                status={whitelistEnabled ? "active" : "inactive"}
              />
              <FeatureItem
                icon="world-outlined"
                title="Short link"
                subTitle={shortLinkValue}
                status={shortLinkValue ? "active" : "inactive"}
              />
              <FeatureItem
                titleColor={colors.error}
                icon="binoculars"
                title="Hidden from Discovery"
                subTitle={`People can only find it via short link (${shortLinkValue ?? "You can set a short link in the previous step"}).`}
                status={!isDiscoverable ? "active" : "inactive"}
              />
            </View>
          </View>

          {hasAboutCommunity && (
            <View
              style={{
                backgroundColor: colors.surfaceContainerLowest,
                gap: 16,
              }}
            >
              <Text variant="labelLarge" prominent style={{ color: colors.onSurface }}>
                About Community
              </Text>

              {!!bannerSrc && (
                <View
                  style={{
                    width: "100%",
                    aspectRatio: COMMUNITY_BANNER_ASPECT_RATIO,
                    borderRadius: 20,
                    overflow: "hidden",
                    backgroundColor: colors.surfaceContainerLowest,
                  }}
                >
                  <Image
                    source={typeof bannerSrc === "string" ? { uri: bannerSrc } : (bannerSrc as any)}
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

              {!!descriptionCommunity && (
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                  {descriptionCommunity}
                </Text>
              )}

            {/* Links detail (main + custom) */}
              {customLinks.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ width: isMobile ? width - 16 * 2 : 448 }}
                >
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    {customLinks.map((l) => (
                      <Button
                        key={`commbtn-${l.text}`}
                        size="small"
                        variant="primary"
                        mode="outlined"
                        leftSvgIconName={
                          l.type === "x" ? "x-logo" : l.type === "tg" ? "tg-logo" : "world-outlined"
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
          )}

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
            <View style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius:20,
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}>
              <DonutWithLegend
                slices={[
                  {
                    value: round(percentGoal, 1),
                    additional: goalSol.toFixed(2),
                    label: "Premarket",
                    color: theme.colors.primary,
                  },
                  {
                    value: 20,
                    label: "Pumpswap pool",
                    color: theme.colors.secondary,
                  },
                  {
                    value: round(80 - percentGoal, 1),
                    label: "Bonding curve",
                    color: theme.colors.onSurface,
                  },
                ]}
              />
            </View>
            
            <View style={{ gap: 8 }}>

              <View
                style={{
                  paddingTop: 16,
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text variant="bodySmall">
                  Initial buy {" "}
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    ~{formatNumberCompact(
                      convertDecimalToToken(
                        convertSolanaToTokenWithFee(
                          {input_sol_lamp:convertSmallCountToLamport(data.tokenomicsData.creatorInitialBuy)}
                    )))} {tokenTicker}
                  </Text>
                </Text>
                <Text variant="bodySmall">{formatNumberNoTrailingZeros(data.tokenomicsData.creatorInitialBuy)} SOL</Text>
              </View>

              <View
                style={{
                  paddingTop: 16,
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text variant="bodySmall">
                  Solana lock {" "}
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    refunded after the premarket finishes
                  </Text>

                </Text>
                <Text variant="bodySmall">{formatNumberNoTrailingZeros(SOL_LOCK)} SOL</Text>
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
                  {formatNumberNoTrailingZeros(data.tokenomicsData.creatorInitialBuy + SOL_LOCK)} SOL
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
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            {onBack && (
              <SvgIconButton
                name="caret-left"
                size={32}
                onPress={onBack}
                color={colors.onSurface}
              />
            )}
            {!error ? (
              <>
                <Button
                  disabled={launchState!==undefined}
                  mode="outlined"
                  onPress={() => onCreateConcept(isDiscoverable)}
                  variant="primary"
                  size="normal"
                  style={{ flex: 1 }}
                >
                  {`Start concept with ${shortAddress}`}
                </Button>
                <Button
                  disabled={launchState!==undefined}
                  mode="contained"
                  onPress={() => onLaunch(isDiscoverable)}
                  variant="primary"
                  size="normal"
                  style={{ flex: 1 }}
                >
                  {`Start premarket with ${shortAddress}`}
                </Button>
              </>
            ) : (
              error.button
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function formatVestingPeriod(seconds: number): string {
  if (seconds <= 0) return "Off";
  if (seconds % (90 * 24 * 3600) === 0) return "3 months";
  if (seconds % (30 * 24 * 3600) === 0) return "1 month";
  if (seconds % (7 * 24 * 3600) === 0) return "1 week";
  if (seconds % (24 * 3600) === 0) return "1 day";
  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${seconds} sec`;
}

function FeatureItem({
  titleColor,
  color,
  icon,
  title,
  subTitle,
  status,
}: {
  icon: IconName;
  title: string;
  subTitle?: string;
  color?: string;
  titleColor?: string;
  status: "active" | "inactive";
}) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  if (status === "inactive" || !subTitle) {
    return null;
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color || colors.primary,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      }}
    >
      <SvgIcon name={icon} size={32} color={ color || colors.primary} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="titleSmall" style={{ color: titleColor || colors.onSurface }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {subTitle}
        </Text>
      </View>
      <SvgIcon name="check" size={24} color={color || colors.primary} />
    </View>
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
