import { View, ActivityIndicator } from "react-native";
import { useTheme, Text, Button } from "react-native-paper";
import { ExtendedMD3Colors } from "@theme/types";
import { useAuth } from "@providers/AuthContext";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useWallet } from "@storage/wallet-adapter";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { outOfPremarket } from "@services/blockchain/premarket/outOfPremarket";
import { userOutOfPremarket } from "@services/api/token";
import { PublicKey } from "@solana/web3.js";
import { TokenDynamicInfo } from "@api/token";
import { convertLamportToSmallCount } from "@utils/premarket";
import BN from "bn.js";

interface YourEntryProps {
  premarketPubkey: PublicKey;
  tokenDynamicInfo: TokenDynamicInfo;
  onUpdated: () => void;
  isMobile: boolean;
}

export function YourEntry({ premarketPubkey, tokenDynamicInfo, onUpdated, isMobile }: YourEntryProps) {
    const theme = useTheme();
    const { network } = useNetwork();
    const connection = getSolanaConnection(network);
    const { connected, connect } = useWallet();
    const { user } = useAuth();
    const wallet = useAnchorWalletSafe();
    const notify = useNotification();
    const { open, replace, close } = useOverlay();

    // Find user's entry data
    const userEntry = tokenDynamicInfo.holders.find((holder) => holder.id === user?.userId);
    if (!userEntry) {
        return null;
    }
    
    // Calculate user's rank/place in premarket
    const sortedHolders = tokenDynamicInfo.holders
        .slice()
        .sort((a, b) => a.joinTimestamp - b.joinTimestamp);
    const userRank = sortedHolders.findIndex(holder => holder.id === userEntry.id) + 1;
    
    // Calculate real values
    const solValue = convertLamportToSmallCount(userEntry.amountSolLamp);
    const entryPrice = solValue > 0 ? 
        convertLamportToSmallCount(new BN(tokenDynamicInfo.currentPriceLamp)): 0;
    const tokens = convertLamportToSmallCount(userEntry.amountSolLamp); // This should be calculated based on the bonding curve
    const supplyPercent = tokenDynamicInfo.marketCapSolLamp.gt(new BN(0)) ? 
        (userEntry.amountSolLamp.toNumber() / tokenDynamicInfo.marketCapSolLamp.toNumber()) * 100 : 0;

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
        if (!user) {
            notify.error("Please log in to continue");
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
    return (
        <View style={{ 
            backgroundColor: (theme.colors as ExtendedMD3Colors).surfaceContainerLowest,
            borderRadius: 20,
            padding: 24,
            gap: 16,
            width: "100%"
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
                <Button 
                    mode="outlined" 
                    compact
                    onPress={handleOut}
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
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        ${parseFloat(entryPrice.toFixed(6))}
                    </Text>
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
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                        {tokens.toFixed(0)}k STNKS
                    </Text>
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
        </View>
    )
}