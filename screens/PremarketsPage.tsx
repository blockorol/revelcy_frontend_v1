import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { PremarketList } from "@components/premarket/PremarketList";
import { useRouter } from "expo-router";
import { PublicKey } from "@solana/web3.js";



export default function PremarketsPage() {
  const theme = useTheme();
  const { colors } = theme;
  const { isMobile } = useIsMobileForTwoScreenWithDemention();

  /*
    const router = useRouter();

  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const candidate = useMemo(() => {
    const raw = query.trim();
    if (!raw) return "";
    // поддержим вставку целого URL вида .../premarket/<pubkey>?...
    const afterRoute = raw.includes("/premarket/")
      ? raw.split("/premarket/").pop() ?? raw
      : raw;
    return afterRoute.split(/[?#]/)[0];
  }, [query]);

  const isValidPubkey = (str: string) => {
    try {
      const pk = new PublicKey(str);
      return pk.toBase58() === str;
    } catch {
      return false;
    }
  };

  const handleSearch = () => {
    setError(null);
    if (!candidate) return;
    if (isValidPubkey(candidate)) {
      router.push(`/premarket/${candidate}`);
    } else {
      setError("Not a valid Solana public key");
    }
  };

  */


  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 12,
        paddingBottom: isMobile ? 70 : undefined,
        backgroundColor: colors.background,
        flex: 1,
      }}
    >

      {/* 
      <Text variant="headlineLarge" style={{ color: colors.onBackground }}>
        Discovery premarkets
      </Text>
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: 8,
        }}
      >
        <PaperInput
          mode="outlined"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (error) setError(null);
          }}
          onSubmitEditing={handleSearch}
          placeholder="Paste premarket pubkey or URL…"
          left={<PaperInput.Icon icon="magnify" />}
          style={{ flex: 1 }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button mode="contained" onPress={handleSearch}>
          Go
        </Button>
      </View>
      {!!error && (
        <HelperText type="error" visible={true} style={{ marginTop: -4 }}>
          {error}
        </HelperText>
      )}

      <PremarketList initialLimit={30} pageSizeOptions={[30, 50, 80]} style={{ flex: 1 }} />

      
      */}


      <PremarketList initialLimit={30} style={{ flex: 1 }} />
    </View>
  );
}
