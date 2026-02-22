import { View, ActivityIndicator } from "react-native";
import { useTheme, Text, Button } from "react-native-paper";
import { ExtendedMD3Colors, AppTheme } from "@theme/types";
import { UserInfo } from "@providers/AuthContext";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useWallet } from "@storage/wallet-adapter";
import { useNotification } from "@providers/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { outOfPremarket } from "@services/blockchain/premarket/outOfPremarket";
import { getHolderEntryPrice, UserEntry } from "@services/api/token";
import { PublicKey } from "@solana/web3.js";
import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import { convertLamportToSmallCount, formatNumberCompact } from "@utils/premarket";
import { useEffect, useState, useMemo, useCallback  } from "react";
import { MD3Colors, MD3Typescale } from "react-native-paper/lib/typescript/types";
import { SvgIcon } from "@components/base/SvgIcon";
import { convertTokenToPersent } from "@services/pumpfun/adds";
import { toVestingVMFromDec, type VestingVM } from "@utils/vesting";
import { hexToRgba } from "@utils/colors";
import TextedLoader from "@components/ui/Loader";
import { clamp, convertNumberWithNull } from "@utils/numbers";
import { splitInput } from "@services/pumpfun/convertors";
import BN from "bn.js";
import SeparatorLine from "@components/premarket/SeparatorLine";
import { VestingSetting } from "@components/premarket/VestingSetting";


interface YourEntryProps {
  premarketPubkey: PublicKey;
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
  userEntry: UserEntry;
  onUpdated: () => void;
  user: UserInfo; 
  isMobile: boolean;
}

export function YourEntry({
    user,
    userEntry,
    premarketPubkey,
    tokenDynamicInfo, tokenMainInfo,
    onUpdated,
    isMobile
}: YourEntryProps){
    const theme = useTheme() as AppTheme;
    const { network } = useNetwork();
    const connection = getSolanaConnection(network);
    const { connected, connect } = useWallet();
    const wallet = useAnchorWalletSafe();
    const notify = useNotification();
    const { open, replace, close: closeOverlay} = useOverlay();
    const [entryPrice, setEntryPrice] = useState<number>(0);
    const [loadingEntryPrice, setLoadingEntryPrice] = useState(true);
    const isVestingEnabled = tokenMainInfo.vestingInfo?.enabled;
    const isVested = isVestingEnabled && tokenMainInfo.state === 'finished';
    console.log("Rendering YourEntry with props:", {
        premarketPubkey: premarketPubkey.toBase58(),
        tokenDynamicInfo,
        tokenMainInfo,
        userEntry,
        network,
        walletPublicKey: wallet?.publicKey.toBase58(),
        isVestingEnabled,
        isVested
    });
    const { inCurve, pumpFee } = splitInput(userEntry.amountSol);
    const refundAmount = Number(convertLamportToSmallCount(inCurve.add(pumpFee)).toFixed(4)).toString();
    const vesting = toVestingVMFromDec({
        totalDec: userEntry.token.totalDec,
        vestedDec: userEntry.token.vestedDec,
        claimedDec: userEntry.token.claimedDec,
    });
    const amountSol = convertLamportToSmallCount(userEntry.amountSol);
    const tokenAmount = convertLamportToSmallCount(userEntry.token.totalDec);
    const supplyPercent = convertTokenToPersent(userEntry.token.totalDec);
    
    // Fetch entry price from backend
    useEffect(() => {
        const fetchEntryPrice = async () => {
            if (!userEntry) return;
            
            try {
                setLoadingEntryPrice(true);
                const response = await getHolderEntryPrice({
                    premarketId: premarketPubkey.toString(),
                    holderWallet: user.walletAddress,
                });
                
                // Backend returns entry_price_lamp, but it appears to be already in SOL format (decimal)
                // Check if it's a decimal (already in SOL) or integer (in lamports)
                const rawValueStr = typeof response.entry_price_lamp === 'string' 
                    ? response.entry_price_lamp 
                    : response.entry_price_lamp.toString();
                const rawValue = parseFloat(rawValueStr);
                
                let price: number;
                // If value contains decimal point or is less than 1 billion, it's likely already in SOL
                if (rawValueStr.includes('.') || rawValue < 1_000_000_000) {
                    // Already in SOL format
                    price = rawValue;
                } else {
                    // In lamports format (integer), convert to SOL
                    const entryPriceLamp = new BN(rawValueStr);
                    price = convertLamportToSmallCount(entryPriceLamp);
                }
                
                console.log("Entry price raw:", rawValueStr, "converted:", price);
                setEntryPrice(price);
            } catch (error) {
                console.error("Failed to fetch entry price:", error);
                // Fallback to 0 if fetch fails
                setEntryPrice(0);
            } finally {
                setLoadingEntryPrice(false);
            }
        };

        fetchEntryPrice();
    }, [premarketPubkey, user.walletAddress]);
   
    // Determine if premarket is expired and user is not creator
    const isExpiredAndNotCreator = useMemo(() => {
        const now = Math.floor(Date.now() / 1000);
        const isPremarket = tokenMainInfo.state === 'premarket';
        const isDeadlinePassed = tokenMainInfo.premarketDeadline < now;
        const isGoalNotReached = tokenDynamicInfo.reservedSolLamp.lt(tokenMainInfo.premarketGoalSolLamp);
        
        // Check if effective state is expired
        const isExpired = tokenMainInfo.state === 'expired' || 
            (isPremarket && isDeadlinePassed && isGoalNotReached);
        
        // Check if user is not the creator
        // Use user?.walletAddress to be consistent with other components, fallback to userEntry.walletAddress
        const userWallet = user.walletAddress.toLowerCase();
        const creatorWallet = tokenMainInfo.createdByPubkey?.toLowerCase() || '';
        const isNotCreator = userWallet !== creatorWallet && userWallet !== '';
        
        // Debug logging
        if (isExpired) {
            console.log('[YourEntry] Expired check:', {
                state: tokenMainInfo.state,
                isPremarket,
                isDeadlinePassed,
                isGoalNotReached,
                isExpired,
                userWalletFromAuth: user?.walletAddress?.toLowerCase(),
                userWallet,
                creatorWallet,
                isNotCreator,
                result: isExpired && isNotCreator
            });
        }
        
        return isExpired && isNotCreator;
    }, [tokenMainInfo.state, tokenMainInfo.premarketDeadline, tokenDynamicInfo.reservedSolLamp, user?.walletAddress]);

    // Check if premarket is canceled (refunded)
    const isRefunded = useMemo(() => {
        return tokenMainInfo.state === 'canceled';
    }, [tokenMainInfo.state]);
    
    // Check if premarket is canceled (refunded)
    const isShowLeaveBtn = useMemo(() => {
        return tokenMainInfo.state !== 'canceled' &&
            tokenMainInfo.state !== 'finished' && 
            tokenMainInfo.state !== 'times_up';
    }, [tokenMainInfo.state]);

    const handleOut = async () => {
        if (!wallet || !connected) {
            notify.error("Wallet is not connected", {
                suggest: "Enable Phantom extension and try again",
                action: {
                    label: "connect",
                    onAction: async () => {
                        try {
                            await connect();
                        } catch (e) {
                            console.log("error during connect:", e);
                        }
                    },
                },
            });
            return;
        }
        if (wallet.publicKey.toString().toLowerCase() !== user.walletAddress.toLowerCase()) {
            notify.error("Connected wallet does not match entry wallet. Please reconnect with the correct wallet.");
            return;
        }
        if (network === 'testnet') {
            notify.error("testnet is not supported");
            return;
        }

        try {
            open(<TextedLoader text={"out of premarket..."}/>);
            await outOfPremarket(wallet, connection, network, premarketPubkey,
                (text) => { <TextedLoader text={text} /> }
            );

            notify.success("Successfully left premarket!");
            closeOverlay();
            onUpdated();
        } catch (e) {
            console.error("outOfPremarket error:", e);
            notify.error("Failed to leave premarket");
            closeOverlay();
        }
    };

    const openLeaveModal = () => {
        open(
        <LeavePremarketModal
            refundAmount={refundAmount}
            onCancel={closeOverlay}
            onConfirm={() => {
                closeOverlay();
                handleOut();
            }}
            isMobile={isMobile} 
        />,
        );
    };

    return (
        <View style={{ 
            backgroundColor: (theme.colors as ExtendedMD3Colors).surfaceContainerLowest,
            borderRadius: 20,
            padding: 24,
            gap: 16,
            width: isMobile ? "92%" : "100%"
        }}>
            <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between", 
                alignItems: "center" 
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                        Your Entry
                    </Text>
                    {userEntry.rankInPremarket > 0 && (
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            #{userEntry.rankInPremarket}
                        </Text>
                    )}
                </View>
                {isShowLeaveBtn && (
                    <Button 
                        mode="outlined" 
                        compact
                        onPress={openLeaveModal}
                        style={{ 
                            borderColor: theme.colors.outline,
                            borderRadius: 8,
                            //width: 68,
                            //height: 28,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 0,
                            paddingHorizontal: 0
                        }}
                        labelStyle={{ 
                            fontSize: 12,
                            width: 50,
                            height: 10,
                            color: theme.colors.onSurfaceVariant,
                            textAlign: 'center',
                            lineHeight: 10
                        }}
                    >
                        <Text>Leave</Text>
                    </Button>
                )}
            </View>
            
            <View style={{ gap: 12 }}>
                <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        SOL value
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        {parseFloat(amountSol.toFixed(4))} SOL
                    </Text>
                </View>
                
                <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        Entry price
                    </Text>
                    {loadingEntryPrice ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <EntryPriceValue 
                            entryPrice={entryPrice} 
                            colors={theme.colors} 
                            fonts={theme.fonts}
                        />
                    )}
                </View>
                
                <SeparatorLine />
                
                <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        Tokens
                    </Text>
                    {loadingEntryPrice ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                            {formatNumberCompact(tokenAmount)} {tokenMainInfo.symbol}
                        </Text>
                    )}
                </View>
                
                <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        Supply %
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        {parseFloat(supplyPercent.toFixed(2))}%
                    </Text>
                </View>
                
                {isVestingEnabled && (
                    <View style={{ gap: 12 }}>
                        <SeparatorLine />
                        {
                            isVested ? <VestingProgressInfo vestingVM={vesting} symbol={tokenMainInfo.symbol} /> : 
                            <VestingSetting
                                periodSec={tokenMainInfo.vestingInfo?.vestingPeriodSec ?? 0}
                                percentInit={tokenMainInfo.vestingInfo?.unlockAtLaunchPercent ?? 0}
                            />
                        }

                    </View>
                    )}
            </View>

            {isExpiredAndNotCreator && (
                <View style={{
                    flexDirection: 'row',
                    gap: 16,
                    alignContent: 'center',
                    justifyContent: 'flex-start',
                    marginTop: 8,
                }}>
                    <SvgIcon name='info-circle' size={24} color={theme.colors.error} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
                            Premarket didn't reach it's goal. Creator has 48 hours to extend the deadline, or you will be refunded
                        </Text>
                    </View>
                </View>
            )}

            {isRefunded && (
                <View style={{
                    flexDirection: 'row',
                    gap: 16,
                    alignContent: 'center',
                    justifyContent: 'flex-start',
                    marginTop: 8,
                }}>
                    <SvgIcon name='info-circle' size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
                            Your entry has been refunded
                        </Text>
                    </View>
                </View>
            )}
        </View>
  );
}

type LeavePremarketModalProps = {
  refundAmount: string;
  onCancel: () => void;
  onConfirm: () => void;
  isMobile: boolean;
};

function LeavePremarketModal({ refundAmount, onCancel, onConfirm, isMobile }: LeavePremarketModalProps) {
  const theme = useTheme() as AppTheme;

  return (
    <View
      style={{
        backgroundColor: (theme.colors as ExtendedMD3Colors).surfaceContainerLow,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 24,
        width: isMobile ? 380 : 480,
        maxWidth: "100%",
        gap: 16,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 4 }}>
        <SvgIcon
          name="arrows-clockwise" 
          size={28}
          color={(theme.colors as ExtendedMD3Colors).onSurface ?? theme.colors.onSurface}
        />
      </View>

      <Text
        variant="headlineSmall"
        style={{ textAlign: "center", color: theme.colors.onSurface, marginBottom: 4 }}
      >
        Leave Premarket
      </Text>

      <Text
        variant="bodyMedium"
        style={{ textAlign: "center", color: theme.colors.onSurface }}
      >
        Are you sure you want to leave the premarket? If you exit now, you'll lose your entry spot
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
        }}
      >
        <SvgIcon name="info-circle" size={20} color={theme.colors.error} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          You will receive a refund of ~{refundAmount} SOL
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 24,
          gap: 12,
        }}
      >
        <Button
          mode="outlined"
          compact
          onPress={onCancel}
          style={{ borderRadius: 14 }}
          contentStyle={{ paddingHorizontal: 16 }}
          labelStyle={{ fontSize: 14 }}
          textColor={theme.colors.onSurface}  
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          compact
          onPress={onConfirm}
          style={{ borderRadius: 14 }}
          contentStyle={{ paddingHorizontal: 16 }}
          labelStyle={{ fontSize: 14 }}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
        >
          Refund
        </Button>
      </View>
    </View>
  );
}

function EntryPriceValue({
    entryPrice,
    colors,
    fonts,
}: {
    entryPrice: number;
    colors: MD3Colors;
    fonts: MD3Typescale;
}) {
    if (entryPrice === 0) {
        return (
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
                $0.00
            </Text>
        );
    }
    if (entryPrice >= 1) {
        const formattedPrice = formatMax5Significant(entryPrice);
        return (
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
                ${formattedPrice}
            </Text>
        );
    }
    const { zeros, val } = convertNumberWithNull(entryPrice);
    if (zeros < 3) {
        return (
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
                ${entryPrice}
            </Text>
        );
    }
    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
                $0.0
            </Text>
            <Text
                style={{
                    color: colors.onSurface,
                    fontSize: (fonts.labelSmall.fontSize as number) * 0.7,
                    fontFamily: fonts.labelSmall.fontFamily,
                    fontWeight: fonts.labelSmall.fontWeight,
                    transform: [
                        { translateY: ((fonts.labelMedium.fontSize as number) * 3) / 4 },
                    ],
                }}
            >
                {zeros}
            </Text>
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
                {val}
            </Text>
        </View>
    );
}

function formatMax5Significant(n: number): string {
    if (n > 1000000) {
        return n.toPrecision();
    }
    return n.toString();
}


function VestingProgressInfo({vestingVM, symbol}: {vestingVM: VestingVM, symbol: string}) {
    const {colors} = useTheme()
    return (
        <View style={{ gap: 12 }}>
            <VestingProgressInfoRow
                label="Vested"
                dotColor={hexToRgba(colors.primary, 0.2)}
                percent={vestingVM.vestedPct}
                amount={vestingVM.vestedAmount}
                symbol={symbol}
                colors={colors}
            />

            <VestingProgressInfoRow
                label="Claimed"
                dotColor={colors.primary}
                percent={vestingVM.claimedPct}
                amount={vestingVM.claimedAmount}   
                symbol={symbol}
                colors={colors}
            />

            <VestingBar
                vestedPercent={vestingVM.vestedPct}
                claimedPercent={vestingVM.claimedPct}
                vestedColor={hexToRgba(colors.primary, 0.2)} 
                claimedColor={colors.primary}             
                trackColor={hexToRgba(colors.onSurface, 0.12)}
            />
        </View>
    )
}

function VestingProgressInfoRow({
  label,
  dotColor,
  percent,
  amount,
  symbol,
  colors,
}: {
  label: string;
  dotColor: string;
  percent: number;
  amount: number;
  symbol: string;
  colors: MD3Colors;
}) {
  const pctText = `${Math.round(clamp(percent, 0, 100))}%`;

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text variant="labelMedium" style={{ color: colors.onSurface }}>
        {label}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: dotColor,
          }}
        />
        <Text
          variant="labelMedium"
          style={{ color: colors.onSurface, fontWeight: "700" }}
        >
          {pctText}
        </Text>
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
          {formatNumberCompact(amount)} {symbol}
        </Text>
      </View>
    </View>
  );
}

function VestingBar({
  vestedPercent,
  claimedPercent,
  vestedColor,
  claimedColor,
  trackColor,
}: {
  vestedPercent: number;
  claimedPercent: number;
  vestedColor: string;
  claimedColor: string;
  trackColor: string;
}) {
  const BAR_HEIGHT = 4;
  const R = BAR_HEIGHT / 2;

  const vested = clamp(vestedPercent, 0, 100);
  const claimed = clamp(claimedPercent, 0, vested);
  const claimedInsideVested = vested > 0 ? claimed / vested : 0; // 0..1

  const GAP_PX = 4;

  const [trackW, setTrackW] = useState(0);

  const onLayout = useCallback((e: any) => {
    const w = e?.nativeEvent?.layout?.width ?? 0;
    if (typeof w === "number" && w > 0) setTrackW(w);
  }, []);

  const { vestedW, gapW, restW, claimedW } = useMemo(() => {
    if (trackW <= 0) {
      return { vestedW: 0, gapW: 0, restW: 0, claimedW: 0 };
    }

    const rawVestedW = (trackW * vested) / 100;

    // gap нужен только когда есть и зелёный, и серый сегменты
    const hasGreen = vested > 0;
    const hasGrey = vested < 100;
    const gW = hasGreen && hasGrey ? GAP_PX : 0;

    const vW = Math.max(0, rawVestedW - (hasGrey ? gW : 0));
    const rW = Math.max(0, trackW - rawVestedW - gW);

    const cW = vW > 0 ? vW * claimedInsideVested : 0;

    return { vestedW: vW, gapW: gW, restW: rW, claimedW: cW };
  }, [trackW, vested, claimedInsideVested]);

  return (
    <View style={{ height: BAR_HEIGHT, marginTop: 6 }} onLayout={onLayout}>
      <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
        {/* Зеленая капсула (Vested) */}
        {vestedW > 0 && (
          <View
            style={{
              width: vestedW,
              height: "100%",
              backgroundColor: vestedColor,
              borderRadius: R,
              overflow: "hidden",
            }}
          >
            {/* Светло-зелёная внутри (Claimed) */}
            {claimedW > 0 && (
              <View
                style={{
                  width: claimedW,
                  height: "100%",
                  backgroundColor: claimedColor,
                  borderRadius: R,
                }}
              />
            )}
          </View>
        )}

        {/* Разрыв (фон карточки) */}
        {gapW > 0 && <View style={{ width: gapW, height: "100%" }} />}

        {/* Серая капсула (остаток) */}
        {restW > 0 && (
          <View
            style={{
              width: restW,
              height: "100%",
              backgroundColor: trackColor,
              borderRadius: R,
            }}
          />
        )}
      </View>
    </View>
  );
}
