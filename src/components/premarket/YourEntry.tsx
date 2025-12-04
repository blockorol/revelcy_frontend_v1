import { View, ActivityIndicator } from "react-native";
import { useTheme, Text, Button } from "react-native-paper";
import { ExtendedMD3Colors, AppTheme } from "@theme/types";
import { useAuth, UserInfo } from "@providers/AuthContext";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useWallet } from "@storage/wallet-adapter";
import { useNotification } from "@providers/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { outOfPremarket } from "@services/blockchain/premarket/outOfPremarket";
import { userOutOfPremarket, getHolderEntryPrice } from "@services/api/token";
import { PublicKey } from "@solana/web3.js";
import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import { convertLamportToSmallCount, formatNumberCompact, convertDecimalToToken } from "@utils/premarket";
import BN from "bn.js";
import { useEffect, useState, useMemo } from "react";
import { MD3Colors, MD3Typescale } from "react-native-paper/lib/typescript/types";
import { SvgIcon } from "@components/base/SvgIcon";
import { convertSolanaToTokenWithFee, splitInput  } from "@services/pumpfun/convertors";
import { DEFAULT_TOKEN_COUNT_DECIMAL } from "@services/pumpfun/adds";


interface YourEntryProps {
  premarketPubkey: PublicKey;
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
  onUpdated: () => void;
  user: UserInfo; 
  isMobile: boolean;
}

export function YourEntry({user, premarketPubkey, tokenDynamicInfo, tokenMainInfo, onUpdated, isMobile }: YourEntryProps) {
    const theme = useTheme() as AppTheme;
    const { network } = useNetwork();
    const connection = getSolanaConnection(network);
    const { connected, connect } = useWallet();
    const wallet = useAnchorWalletSafe();
    const notify = useNotification();
    const { open, replace, close } = useOverlay();
    const [entryPrice, setEntryPrice] = useState<number>(0);
    const [loadingEntryPrice, setLoadingEntryPrice] = useState(true);

    // Find user's entry data
    const userEntry = tokenDynamicInfo.holders.find((holder) => holder.id === user.userId);
    if (!userEntry) {
        return null;
    }
    
    // Calculate user's rank/place in premarket
    const sortedHolders = tokenDynamicInfo.holders
        .slice()
        .sort((a, b) => a.joinTimestamp - b.joinTimestamp);
    const userRank = sortedHolders.findIndex(holder => holder.id === userEntry.id) + 1;
    
    // Fetch entry price from backend
    useEffect(() => {
        const fetchEntryPrice = async () => {
            if (!userEntry) return;
            
            try {
                setLoadingEntryPrice(true);
                const response = await getHolderEntryPrice({
                    premarketId: premarketPubkey.toString(),
                    holderWallet: userEntry.walletAddress,
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
    }, [premarketPubkey, userEntry?.walletAddress]);
    
    // Calculate real values
    const solValue = convertLamportToSmallCount(userEntry.amountSolLamp);
    const { inCurve, pumpFee } = splitInput(userEntry.amountSolLamp);
    const refundLamports = inCurve.add(pumpFee);
    const refundAmount = parseFloat(convertLamportToSmallCount(refundLamports).toFixed(4));
    
    // Calculate reserves at entry time (cumulative from all holders who joined strictly before user)
    const entryReserves = useMemo(() => {
        // Get all holders who joined strictly before the user (or at same time but different id, sorted by timestamp then id)
        const holdersBeforeUser = tokenDynamicInfo.holders
            .filter(holder => 
                holder.joinTimestamp < userEntry.joinTimestamp || 
                (holder.joinTimestamp === userEntry.joinTimestamp && holder.id !== userEntry.id)
            )
            .sort((a, b) => {
                if (a.joinTimestamp !== b.joinTimestamp) {
                    return a.joinTimestamp - b.joinTimestamp;
                }
                // If same timestamp, sort by id for consistency
                return a.id.localeCompare(b.id);
            });
        
        // Calculate cumulative SOL reserves at entry time
        let cumulativeSolLamp = new BN(0);
        let remainingTokensDec = DEFAULT_TOKEN_COUNT_DECIMAL;
        
        // For each holder before the user, calculate their tokens and update reserves
        for (const holder of holdersBeforeUser) {
            // Calculate tokens this holder got
            const holderTokens = convertSolanaToTokenWithFee({
                input_sol_lamp: holder.amountSolLamp,
                before_lamp: cumulativeSolLamp,
            });
            
            // Update cumulative reserves for next holder
            cumulativeSolLamp = cumulativeSolLamp.add(holder.amountSolLamp);
            remainingTokensDec = remainingTokensDec.sub(holderTokens);
        }
        
        return {
            reserves_sol: cumulativeSolLamp,
            reserves_token: remainingTokensDec,
        };
    }, [tokenDynamicInfo.holders, userEntry.joinTimestamp, userEntry.id]);
    
    // Calculate tokens using bonding curve formula (same as join section)
    const tokensBN = useMemo(() => {
        if (loadingEntryPrice) {
            return new BN(0);
        }
        // Always use bonding curve formula with calculated reserves at entry time
        return convertSolanaToTokenWithFee({
            input_sol_lamp: userEntry.amountSolLamp,
            before_lamp: entryReserves.reserves_sol,
        });
    }, [userEntry.amountSolLamp, entryReserves, loadingEntryPrice]);
    
    const tokens = convertDecimalToToken(tokensBN);
    const MAX_SOL = 85; // TODO: find real max sol
    const supplyPercent = (solValue / MAX_SOL) * 100;

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
                userWalletFromEntry: userEntry.walletAddress?.toLowerCase(),
                userWallet,
                creatorWallet,
                isNotCreator,
                result: isExpired && isNotCreator
            });
        }
        
        return isExpired && isNotCreator;
    }, [tokenMainInfo.state, tokenMainInfo.premarketDeadline, tokenMainInfo.createdByPubkey, tokenDynamicInfo.reservedSolLamp, user?.walletAddress, userEntry.walletAddress]);

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


    const renderLoader = (status: string) => (
        <View style={{ gap: 20 }}>
            <Text variant="titleMedium">{status}</Text>
            <ActivityIndicator animating color={theme.colors.primary} size="large" />
        </View>
    );

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
            open(renderLoader("out of premarket..."));
            const res = await outOfPremarket(wallet, connection, network, premarketPubkey,
                (text) => { replace(renderLoader(text)) }
            );

            replace(renderLoader("Syncing with backend..."));
            await userOutOfPremarket({
                tx: res.txId,
                userWallet: wallet.publicKey.toString(),
                userId: user.userId,
                premarketPubKey: premarketPubkey.toString()
            });

            notify.success("Successfully left premarket!");
            close();
            onUpdated();
        } catch (e) {
            console.error("outOfPremarket error:", e);
            notify.error("Failed to leave premarket");
            close();
        }
    };

    const openLeaveModal = () => {
        open(
        <LeavePremarketModal
            refundAmount={refundAmount}
            onCancel={close}
            onConfirm={() => {
            
            close();
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
                    {userRank > 0 && (
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            #{userRank}
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
                        {parseFloat(solValue.toFixed(4))} SOL
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
                
                {/* Separator line */}
                <View style={{
                    height: 1,
                    backgroundColor: theme.colors.outline,
                    marginVertical: 8
                }} />
                
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
                            {formatNumberCompact(tokens)} {tokenMainInfo.symbol}
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
  refundAmount: number;
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
          You will receive a refund of {refundAmount} SOL
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

function convertNumberWithNull(num: number): { zeros: number; val: number } {
    if (num === 0) return { zeros: 0, val: 0 };
    
    // Use decimal string approach for more accurate counting
    const decimalStr = num.toString().split('.')[1] || '';
    const leadingZeros = decimalStr.match(/^0*/)?.[0].length || 0;
    const rest = decimalStr.slice(leadingZeros);
    
    // Limit val to maximum 2 decimal places
    const truncatedRest = rest.substring(0, 2);
    
    return { zeros: leadingZeros, val: parseInt(truncatedRest) };
}