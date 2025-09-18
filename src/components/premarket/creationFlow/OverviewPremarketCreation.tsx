// components/token/TokenOverviewCreation.tsx
import React, { useMemo, useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { Text, Button, useTheme, Divider, Modal, ActivityIndicator } from "react-native-paper";
import { format } from "date-fns";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import useIsMobile from "@hooks/useIsMobile";
import { useWallet } from "@storage/wallet-adapter";
import { IconName, SvgIcon } from "@components/base/SvgIcon";
import { TokenCreateFullData } from "@components/token/create/interface";
import { ExtendedMD3Colors } from "@theme/types";

type Props = {
  data: TokenCreateFullData;
  onLaunch: () => void;
  launchState: string | undefined
  onClose?: () => void;
  onBack?: () => void;
};

export default function OverviewPremarketCreation({ data, onLaunch, launchState, onClose, onBack}: Props) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const isMobile = useIsMobile();
  const { publicKey, connected } = useWallet();

  const shortAddress = useMemo(() => {
    if (!connected || !publicKey) return "";
    const s = publicKey.toString();
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  }, [connected, publicKey]);

  const { tokenName, tokenTicker, description, avatar, links } = data.mainData;
  const { tokenomicsData, customData } = data;

  // custom links
  const customLinks = customData?.links ?? [];

  // banner
  const bannerSrc =
    customData?.banner?.url ??
    (customData?.banner?.data ? { uri: customData.banner.data } : undefined);
    
  // description
  const descriptionCommunity =
    customData?.description;

  // premaket data
  const prem = (data as any).premarket as
    | { deadline?: number; goalPercent?: number; goalSol?: number }
    | undefined;

  const deadlineText =
    prem?.deadline ? format(new Date(prem.deadline * 1000), "dd.MM.yyyy HH:mm (XXX)") : undefined;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.surface, borderRadius: isMobile ? 0 : 16 }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          padding: 24,
          justifyContent: "flex-start",
          alignItems: "stretch",
          width: "100%",
          gap: 24,
        }}
      >
        {launchState && <View style={{
          position: 'absolute', 
          width: '100%', height:'100%',
          zIndex:9999,
          backgroundColor: theme.colors.shadow,
          alignItems: "center",
          justifyContent: 'center'
          }}>
          <View style={{backgroundColor: colors.surfaceContainerHighest, gap: 20, padding: 16, borderRadius: 16}}>
            <Text variant='titleMedium'> {launchState}</Text>
             <ActivityIndicator animating color={theme.colors.primary} size="large" />
          </View>
        </View>}

        <TokenCreateFormHeader title="Overview" theme={theme} onClose={onClose} onBack={onBack} />

        {/* Top block: avatar + name/ticker + socials */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
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
              <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text variant="headlineMedium" style={{ color: colors.onSurface }}>
                +
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={{ color: colors.onSurface }}>
              {tokenName || "Unnamed"}
            </Text>
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
              {tokenTicker || "—"}
            </Text>
          </View>

          {/* quick socials icons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {links?.twitter ? <SvgIcon name="x-logo" size={22} color={colors.onSurface} /> : null}
            {links?.website ? <SvgIcon name="world-outlined" size={22} color={colors.onSurface} /> : null}
            {links?.telegram ? <SvgIcon name="tg-logo" size={22} color={colors.onSurface} /> : null}
          </View>
        </View>

        {/* Description */}
        {description ? (
          <View style={{ gap: 6 }}>
            <Text variant="titleMedium" style={{ color: colors.onSurface }}>
              Description
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {description}
            </Text>
          </View>
        ) : null}
        {/* Links detail (main + custom) */}
        {(links?.twitter || links?.telegram || links?.website) && (
          <View style={{ gap: 8 }}>
            <Text variant="titleMedium" style={{ color: colors.onSurface }}>
              Links
            </Text>
            {links?.twitter && (
              <RowLine icon="x-logo" label="Twitter / X" value={links.twitter} />
            )}
            {links?.website && (
              <RowLine icon="world-outlined" label="Website" value={links.website} />
            )}
            {links?.telegram && (
              <RowLine icon="tg-logo" label="Telegram" value={links.telegram} />
            )}
          </View>
        )}

        <Divider style={{ opacity: 0.2 }} />
        
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Community
        </Text>
        
        {/* Banner */}
        {bannerSrc && (
          <Image
            source={typeof bannerSrc === "string" ? { uri: bannerSrc } : (bannerSrc as any)}
            style={{
              width: "100%",
              height: 160,
              borderRadius: 16,
              resizeMode: "cover",
              backgroundColor: colors.surfaceVariant,
            }}
          />
        )}
        
        {/* Description */}
        {descriptionCommunity ? (
          <View style={{ gap: 6 }}>
            <Text variant="titleMedium" style={{ color: colors.onSurface }}>
              Description community
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {descriptionCommunity}
            </Text>
          </View>
        ) : null}

        {/* Links detail (main + custom) */}
        { customLinks.length > 0 && (
          <View style={{ gap: 8 }}>
            {customLinks.map((l, i) => (
              <RowLine
                key={`${l.url}-${i}`}
                icon={l.type === "x" ? 'x-logo' : l.type === "tg" ? 'tg-logo' : 'world-outlined'}
                label={l.text}
                value={l.url}
              />
            ))}
          </View>
        )}

        <Divider style={{ opacity: 0.2 }} />

        {/* Tokenomics */}
        <View style={{ gap: 12 }}>
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>
            Tokenomics
          </Text>

          <RowLine
            icon='wallet-outlined'
            label="Creator initial buy"
            value={`${tokenomicsData.creatorInitialBuy} SOL`}
          />

          {/* <BarLine label="Team allocation" pct={teamPct} />
          <BarLine label="Treasury allocation" pct={treasuryPct} />
          <BarLine label="Unallocated" pct={remainingPct} dim />

          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            * Percentages are relative to total allocation you set here.
          </Text> */}
        </View>

        {/* Premarket (optional) */}
        {(prem?.deadline || prem?.goalPercent || prem?.goalSol) && (
          <>
            <Divider style={{ opacity: 0.2 }} />
            <View style={{ gap: 12 }}>
              <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                Premarket
              </Text>
              {deadlineText && (
                <RowLine icon='plant-outlined' label="Deadline" value={deadlineText} />
              )}
              {typeof prem?.goalPercent === "number" && (
                <RowLine
                  icon='search'
                  label="Goal"
                  value={`${prem!.goalPercent}%${prem?.goalSol ? `  (${prem!.goalSol} SOL)` : ""}`}
                />
              )}
            </View>
          </>
        )}

        {/* Launch CTA */}
        {shortAddress ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Button mode="contained" onPress={onLaunch}>
              {`Start premarket with ${shortAddress}`}
            </Button>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              Wallet connected
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 16, color: colors.primary }}>
            Please connect wallet to start premarket
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

/** Small row with icon + label + value */
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
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <SvgIcon name={icon} size={18} color={colors.onSurface} />
      <Text variant="labelLarge" style={{ color: colors.onSurface, flex: 1 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, maxWidth: "60%" }}>
        {value}
      </Text>
    </View>
  );
}

/** Percent bar line */
function BarLine({
  label,
  pct,
  dim = false,
}: {
  label: string;
  pct: number;
  dim?: boolean;
}) {
  const { colors } = useTheme();
  const safe = Math.max(0, Math.min(100, pct || 0));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="labelLarge" style={{ color: colors.onSurface }}>
          {label}
        </Text>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {safe.toFixed(1)}%
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: colors.surfaceVariant,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${safe}%`,
            height: "100%",
            backgroundColor: dim ? colors.outline : colors.primary,
          }}
        />
      </View>
    </View>
  );
}
