// TokenMathPlaygroundScreen.tsx
import { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, useTheme, Switch, HelperText, Divider, Card } from "react-native-paper";
import { BN } from "@coral-xyz/anchor";

// 🔁 ПОДМЕНИ путь на свой (где лежат твои функции)
import {
  LAMPORT_MULTIPLIER,
  convertCountToLamport,
  convertDecimalToToken,
  convertLamportToSmallCount,
  convertSmallCountToLamport,
  convertSolToPercentOnStart,
  convertTimeStampToDataMonth,
  convertTokenToDecimal,
  formatNumberCompact,
  getTimeLeftLabel,
} from "@utils/premarket";
import { convertSolanaToTokenBuy, convertTokenToSolanaBuy, convertTokenToSolanaSell, DEFAULT_TOKEN_COUNT, DEFAULT_TOKEN_COUNT_DECIMAL, virtualSupplyRatioLamp, virtualTokenRatioDecim } from "@services/pumpfun/bonding_curve_convertor";

type NumStr = string;

/**
 * Helpers
 */
function toBNFrom9dec(nStr: NumStr): BN {
  // 9 знаков после запятой (как у лампортов)
  const n = Number(nStr || "0");
  return convertCountToLamport(n);
}

function toBNFrom6dec(nStr: NumStr): BN {
  // 6 знаков после запятой (как у твоего token-decimal)
  const n = Number(nStr || "0");
  const parts = n.toFixed(6).split(".");
  const whole = parts[0];
  const frac = (parts[1] || "").padEnd(6, "0");
  return new BN(`${whole}${frac}`);
}

function prettyBN(bn?: BN): string {
  if (!bn) return "-";
  try {
    const str = bn.toString();

    let expStr: string;
    try {
      expStr = Number(str).toExponential(2); // 2 знака после запятой
    } catch {
      expStr = "too big";
    }

    const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return `${formatted} (≈${expStr})`;
  } catch {
    return `${bn}`;
  }
}

export default function TokenMathPlaygroundScreen() {
  const theme = useTheme();

  // ======= СЕКЦИЯ 1: Лампорт ↔ число с 9 знаками =======
  const [lamportsIn, setLamportsIn] = useState<NumStr>("0"); // 1 SOL
  const lamportsBN = useMemo(() => new BN(lamportsIn || "0"), [lamportsIn]);
  const lamportsToNum = useMemo(() => convertLamportToSmallCount(lamportsBN), [lamportsBN]);

  const [num9In, setNum9In] = useState<NumStr>("0"); // 1.5 SOL
  const num9ToBN = useMemo(() => convertSmallCountToLamport(Number(num9In || "0")), [num9In]);

  // ======= СЕКЦИЯ 2: Token-decimal (6) ↔ human =======
  const [tokenDecIn, setTokenDecIn] = useState<NumStr>("0"); // 6 знаков, лишние обрежутся
  const tokenDecBN = useMemo(() => toBNFrom6dec(tokenDecIn), [tokenDecIn]);
  const tokenHumanFromDec = useMemo(() => convertDecimalToToken(tokenDecBN), [tokenDecBN]);

  const [tokenHumanIn, setTokenHumanIn] = useState<NumStr>("0");
  const tokenHumanToDecBN = useMemo(() => convertTokenToDecimal(Number(tokenHumanIn || "0")), [tokenHumanIn]);

  // ======= СЕКЦИЯ 3: Процент ↔ оценка SOL на старте =======

  const [solAtStartIn, setSolAtStartIn] = useState<NumStr>("1");
  const solToPercent = useMemo(() => convertSolToPercentOnStart(Number(solAtStartIn || "0")), [solAtStartIn]);

  // ======= СЕКЦИЯ 4: AMM формулы =======
  const [solBuyIn, setSolBuyIn] = useState<NumStr>("0"); // SOL, 9 dec
  const [resSolIn, setResSolIn] = useState<NumStr>("0"); // SOL, 9 dec
  const [resTokIn, setResTokIn] = useState<NumStr>(String(DEFAULT_TOKEN_COUNT)); // токены, 6 dec (human)
  // прим: для reserves_token нужен decimal (6). Возьмем human->decimal BN
  const reservesSolBN = useMemo(() => toBNFrom9dec(resSolIn), [resSolIn]);
  const reservesTokBN = useMemo(() => convertTokenToDecimal(Number(resTokIn || "0")), [resTokIn]);
  const solAmountBN = useMemo(() => toBNFrom9dec(solBuyIn), [solBuyIn]);

  const tokenOutBuyBN = useMemo(() => {
    try {
      return convertSolanaToTokenBuy({
        sol_amount: solAmountBN,
        reserves_sol: reservesSolBN,
        reserves_token: reservesTokBN,
      });
    } catch {
      return undefined;
    }
  }, [solAmountBN, reservesSolBN, reservesTokBN]);

  const [tokenToBuyIn, setTokenToBuyIn] = useState<NumStr>("100.0"); // human tokens -> decimal
  const tokenToBuyBN = useMemo(() => convertTokenToDecimal(Number(tokenToBuyIn || "0")), [tokenToBuyIn]);

  const solOutForBuyBN = useMemo(() => {
    try {
      return convertTokenToSolanaBuy({
        token_amount: tokenToBuyBN,
        reserves_sol: reservesSolBN,
        reserves_token: reservesTokBN,
      });
    } catch {
      return undefined;
    }
  }, [tokenToBuyBN, reservesSolBN, reservesTokBN]);

  const solOutForSellBN = useMemo(() => {
    try {
      return convertTokenToSolanaSell({
        token_amount: tokenToBuyBN,
        reserves_sol: reservesSolBN,
        reserves_token: reservesTokBN,
      });
    } catch {
      return undefined;
    }
  }, [tokenToBuyBN, reservesSolBN, reservesTokBN]);

  // ======= СЕКЦИЯ 5: Форматирование чисел =======
  const [fmtIn, setFmtIn] = useState<NumStr>("12345678");
  const fmtResult = useMemo(() => formatNumberCompact(Number(fmtIn || "0")), [fmtIn]);

  // ======= СЕКЦИЯ 6: Время =======
  const [tsIn, setTsIn] = useState<NumStr>(String(Math.floor(Date.now() / 1000) + 3600)); // +1 час, секунды
  const timeLeft = useMemo(() => getTimeLeftLabel(Number(tsIn || "0")), [tsIn]);
  const tsToLabel = useMemo(() => convertTimeStampToDataMonth(Number(tsIn || "0")), [tsIn]);

  // ======= Визуальные =======
  const [showAdvanced, setShowAdvanced] = useState(true);

  return (
    <ScrollView style={{ padding: 16, backgroundColor: "grey" }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🧪 Token Math Playground</Text>

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* LEFT: Guide & quick checks */}
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Как пользоваться
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Справа меняй параметры и жми кнопки «Посчитать». Здесь проверяются конверсии лампортов, токенов (6 знаков),
            проценты старта, и формулы AMM (buy/sell). Значения с плавающей точкой автоматически переводятся в BN с
            нужной точностью (9 или 6 знаков).
          </Text>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Быстрые Presets</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <Button
              mode="contained"
              onPress={() => {
                setLamportsIn("1000000000");
                setNum9In("1.5");
                setTokenDecIn("123.456789");
                setTokenHumanIn("250.25");
                setSolAtStartIn("1.0");
                setSolBuyIn("0.5");
                setResSolIn("0");
                setResTokIn(String(DEFAULT_TOKEN_COUNT));
                setTokenToBuyIn("100.0");
                setFmtIn("12345678");
                setTsIn(String(Math.floor(Date.now() / 1000) + 3600));
              }}
            >
              Reset
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setResSolIn("10");
                setResTokIn(String(DEFAULT_TOKEN_COUNT * 0.8));
              }}
            >
              More reserves
            </Button>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Константы</Text>
          <Card style={{ marginTop: 8 }}>
            <Card.Content>
              <Text>DEFAULT_TOKEN_COUNT: {DEFAULT_TOKEN_COUNT}</Text>
              <Text>DEFAULT_TOKEN_COUNT_DECIMAL (BN): {prettyBN(DEFAULT_TOKEN_COUNT_DECIMAL)}</Text>
              <Text>LAMPORT_MULTIPLIER: {LAMPORT_MULTIPLIER}</Text>
              <Text>virtualSupplyRatioLamp: {prettyBN(virtualSupplyRatioLamp)}</Text>
              <Text>virtualTokenRatioDecim: {prettyBN(virtualTokenRatioDecim)}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* RIGHT: Controls */}
        <View style={styles.controls}>
          {/* SECTION 1 */}
          <Text style={styles.groupTitle}>1) Lamports ↔ number (9 dec)</Text>
          <TextInput
            label="Lamports (BN.toString())"
            value={lamportsIn}
            onChangeText={setLamportsIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ ${lamportsToNum}`}
          </HelperText>

          <TextInput
            label="Number (9 dec) → to Lamports BN"
            value={num9In}
            onChangeText={setNum9In}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ BN: ${prettyBN(num9ToBN)}`}
          </HelperText>

          {/* SECTION 2 */}
          <Text style={styles.groupTitle}>2) Token-decimal (6) ↔ human</Text>
          <TextInput
            label="Token decimal (6) → human"
            value={tokenDecIn}
            onChangeText={setTokenDecIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ ${tokenHumanFromDec} tokens`}
          </HelperText>

          <TextInput
            label="Token human → decimal BN (6)"
            value={tokenHumanIn}
            onChangeText={setTokenHumanIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ BN: ${prettyBN(tokenHumanToDecBN)}`}
          </HelperText>

          {/* SECTION 3 */}
          <TextInput
            label="SOL at start → Percent of supply"
            value={solAtStartIn}
            onChangeText={setSolAtStartIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ ${solToPercent.toFixed(6)} %`}
          </HelperText>

          {/* SECTION 4 */}
          <Divider style={{ marginVertical: 16 }} />
          <View style={styles.rowBetween}>
            <Text style={styles.groupTitle}>4) AMM формулы</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text>advanced</Text>
              <Switch value={showAdvanced} onValueChange={setShowAdvanced} />
            </View>
          </View>

          <TextInput
            label="reserves_sol (SOL, 9 dec number)"
            value={resSolIn}
            onChangeText={setResSolIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <TextInput
            label="reserves_token (human tokens)"
            value={resTokIn}
            onChangeText={setResTokIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />

          <Text style={styles.subTitle}>Buy: SOL → Tokens</Text>
          <TextInput
            label="sol_amount (SOL, number with 9 dec)"
            value={solBuyIn}
            onChangeText={setSolBuyIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`tokenOut (decimal BN): ${prettyBN(tokenOutBuyBN)}`}
          </HelperText>
          <HelperText type="info" visible>
            {`≈ human tokens: ${
              tokenOutBuyBN ? convertDecimalToToken(tokenOutBuyBN).toFixed(6) : "-"
            }`}
          </HelperText>

          <Text style={styles.subTitle}>Buy exact tokens: Tokens → SOL (затраты)</Text>
          <TextInput
            label="token_amount (human tokens to buy)"
            value={tokenToBuyIn}
            onChangeText={setTokenToBuyIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`SOL needed (lamports BN): ${prettyBN(solOutForBuyBN)}`}
          </HelperText>
          <HelperText type="info" visible>
            {`≈ SOL number: ${solOutForBuyBN ? convertLamportToSmallCount(solOutForBuyBN) : "-"}`}
          </HelperText>

          <Text style={styles.subTitle}>Sell tokens: Tokens → SOL (выручка)</Text>
          <HelperText type="info" visible>
            {`SOL out (lamports BN): ${prettyBN(solOutForSellBN)}`}
          </HelperText>
          <HelperText type="info" visible>
            {`≈ SOL number: ${solOutForSellBN ? convertLamportToSmallCount(solOutForSellBN) : "-"}`}
          </HelperText>

          {showAdvanced && (
            <>
              <HelperText type="info" visible>
                В формулах участвуют виртуальные резервы:
                {" "}
                sol+=virtualSupplyRatioLamp, token+=virtualTokenRatioDecim.
              </HelperText>
            </>
          )}

          {/* SECTION 5 */}
          <Divider style={{ marginVertical: 16 }} />
          <Text style={styles.groupTitle}>5) formatNumberCompact</Text>
          <TextInput
            label="Number to format"
            value={fmtIn}
            onChangeText={setFmtIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`→ ${fmtResult}`}
          </HelperText>

          {/* SECTION 6 */}
          <Divider style={{ marginVertical: 16 }} />
          <Text style={styles.groupTitle}>6) Time helpers</Text>
          <TextInput
            label="Timestamp (sec or ms)"
            value={tsIn}
            onChangeText={setTsIn}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <HelperText type="info" visible>
            {`getTimeLeftLabel → ${timeLeft}`}
          </HelperText>
          <HelperText type="info" visible>
            {`convertTimeStampToDataMonth → ${tsToLabel}`}
          </HelperText>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  controls: {
    width: 420,
    marginLeft: 16,
    paddingBottom: 100,
  },
  groupTitle: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#666",
  },
  subTitle: {
    marginTop: 10,
    fontWeight: "600",
  },
  rowBetween: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});