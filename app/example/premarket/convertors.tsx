// TokenMathPlaygroundScreen.tsx
import { useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Switch,
  HelperText,
  Divider,
  Card,
  SegmentedButtons,
} from "react-native-paper";
import TextInput from "@components/ui/TextInput";
import { BN } from "@coral-xyz/anchor";

import {
  LAMPORT_MULTIPLIER,
  convertCountToLamport,
  convertDecimalToToken,
  convertLamportToSmallCount,
  convertSmallCountToLamport,
  convertTimeStampToDataMonth,
  convertTokenToDecimal,
  formatNumberCompact,
  getTimeLeftLabel,
} from "@utils/premarket";
import {
  DEFAULT_TOKEN_COUNT,
  DEFAULT_TOKEN_COUNT_DECIMAL,
  virtualSupplyRatioLamp,
  virtualTokenRatioDecim,
} from "@services/pumpfun/deprecated";
import { convertSolanaToTokenNoFee_Rust } from "@services/pumpfun/convertors";
import { convertSolToPercentOnStart } from "@services/pumpfun/adds";

type NumStr = string;

// ------------------ Helpers ------------------
function toBNFrom9dec(nStr: NumStr): BN {
  const n = Number(nStr || "0");
  return convertCountToLamport(n);
}

function toBNFrom6dec(nStr: NumStr): BN {
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
      expStr = Number(str).toExponential(2);
    } catch {
      expStr = "too big";
    }
    const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${formatted} (≈${expStr})`;
  } catch {
    return `${bn}`;
  }
}

// Безопасный onChange для любых инпутов — не падаем на undefined/null
const makeSafeOnChange =
  (setter: (v: string) => void) =>
  (text?: string | null) =>
    setter(text ?? "");

// ------------------ Component ------------------
type TabKey =  "lamports" | "token" | "start" | "amm" | "format" | "time";

export default function TokenMathPlaygroundScreen() {
  const theme = useTheme();

  // ======= Табы =======
  const [tab, setTab] = useState<TabKey>("lamports");

  // ======= СЕКЦИЯ 1: Лампорт ↔ число с 9 знаками =======
  const [lamportsIn, setLamportsIn] = useState<NumStr>("0");
  const lamportsBN = useMemo(() => new BN(lamportsIn || "0"), [lamportsIn]);
  const lamportsToNum = useMemo(
    () => convertLamportToSmallCount(lamportsBN),
    [lamportsBN]
  );

  const [num9In, setNum9In] = useState<NumStr>("0");
  const num9ToBN = useMemo(
    () => convertSmallCountToLamport(Number(num9In || "0")),
    [num9In]
  );

  // ======= СЕКЦИЯ 2: Token-decimal (6) ↔ human =======
  const [tokenDecIn, setTokenDecIn] = useState<NumStr>("0");
  const tokenDecBN = useMemo(() => toBNFrom6dec(tokenDecIn), [tokenDecIn]);
  const tokenHumanFromDec = useMemo(
    () => convertDecimalToToken(tokenDecBN),
    [tokenDecBN]
  );

  const [tokenHumanIn, setTokenHumanIn] = useState<NumStr>("0");
  const tokenHumanToDecBN = useMemo(
    () => convertTokenToDecimal(Number(tokenHumanIn || "0")),
    [tokenHumanIn]
  );

  // ======= СЕКЦИЯ 3: Процент ↔ оценка SOL на старте =======
  const [solAtStartIn, setSolAtStartIn] = useState<NumStr>("1");
  const solToPercent = useMemo(
    () => convertSolToPercentOnStart(Number(solAtStartIn || "0")),
    [solAtStartIn]
  );

  // ======= СЕКЦИЯ 4: AMM формулы =======

  
  const [solBefore, setSolBefore] = useState<NumStr>("0"); // SOL, number
  const [solToBuy, setSolToBuy] = useState<NumStr>("0"); // SOL, number
  const [calculatedTokenAmount, setCalculatedTokenAmount] = useState<NumStr>("0"); // Token, number
  const [calculatedTokenAmount2, setCalculatedTokenAmount2] = useState<NumStr>("0"); // Token, number
  

  const [showAdvanced, setShowAdvanced] = useState(true);

  // ======= СЕКЦИЯ 5: Форматирование чисел =======
  const [fmtIn, setFmtIn] = useState<NumStr>("12345678");
  const fmtResult = useMemo(
    () => formatNumberCompact(Number(fmtIn || "0")),
    [fmtIn]
  );

  // ======= СЕКЦИЯ 6: Время =======
  const [tsIn, setTsIn] = useState<NumStr>(
    String(Math.floor(Date.now() / 1000) + 3600)
  ); // +1 час, секунды
  const timeLeft = useMemo(() => getTimeLeftLabel(Number(tsIn || "0")), [tsIn]);
  const tsToLabel = useMemo(
    () => convertTimeStampToDataMonth(Number(tsIn || "0")),
    [tsIn]
  );

  // Presets
  const onReset = useCallback(() => {
    setLamportsIn("1000000000");
    setNum9In("1.5");
    setTokenDecIn("123.456789");
    setTokenHumanIn("250.25");
    setSolAtStartIn("1.0");
    setFmtIn("12345678");
    setTsIn(String(Math.floor(Date.now() / 1000) + 3600));
  }, []);

  return (
    <ScrollView style={{ padding: 16, backgroundColor: "grey" }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🧪 Token Math Playground</Text>

      {/* ТАБ-БАР */}
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        buttons={[
          { value: "lamports", label: "Lamports ↔ number" },
          { value: "token", label: "Token 6↔human" },
          { value: "start", label: "Start %" },
          { value: "amm", label: "AMM" },
          { value: "format", label: "Format" },
          { value: "time", label: "Time" },
        ]}
        density="regular"
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
        {/* RIGHT: Controls (по табам) */}
        <View style={styles.controls}>
          {tab === "lamports" && (
            <>
              <TextInput
                label="Lamports (BN.toString())"
                value={lamportsIn ?? ""} // всегда строка
                onChangeText={makeSafeOnChange(setLamportsIn)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ ${lamportsToNum}`}
              </HelperText>

              <TextInput
                label="Number (9 dec) → to Lamports BN"
                value={num9In ?? ""}
                onChangeText={makeSafeOnChange(setNum9In)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ BN: ${prettyBN(num9ToBN)}`}
              </HelperText>
            </>
          )}

          {tab === "token" && (
            <>
              <TextInput
                label="Token decimal (6) → human"
                value={tokenDecIn ?? ""}
                onChangeText={makeSafeOnChange(setTokenDecIn)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ ${tokenHumanFromDec} tokens`}
              </HelperText>

              <TextInput
                label="Token human → decimal BN (6)"
                value={tokenHumanIn ?? ""}
                onChangeText={makeSafeOnChange(setTokenHumanIn)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ BN: ${prettyBN(tokenHumanToDecBN)}`}
              </HelperText>
            </>
          )}

          {tab === "start" && (
            <>
              <Text style={styles.groupTitle}>3) Percent on start</Text>
              <TextInput
                label="SOL at start → Percent of supply"
                value={solAtStartIn ?? ""}
                onChangeText={makeSafeOnChange(setSolAtStartIn)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ ${solToPercent.toFixed(6)} %`}
              </HelperText>
            </>
          )}

          {tab === "amm" && (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.groupTitle}>AMM формулы</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text>advanced</Text>
                  <Switch value={showAdvanced} onValueChange={setShowAdvanced} />
                </View>
              </View>

              <View>
                <Text style={styles.groupTitle}>Pumpfun formulas</Text>
                <Text style={styles.subTitle}>Buy: SOL → Tokens</Text>
                
                <View style={styles.rowStart}>
                  <View style={styles.smallInput}>
                    <Text>before</Text>
                    <TextInput
                      label="SOL"
                      value={solBefore ?? ""}
                      onChangeText={makeSafeOnChange(setSolBefore)}
                      mode="outlined"
                      autoCapitalize="none"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.smallInput}>
                    <Text>buy</Text>
                    <TextInput
                      label="SOL"
                      value={solToBuy ?? ""}
                      onChangeText={makeSafeOnChange(setSolToBuy)}
                      mode="outlined"
                      autoCapitalize="none"
                      keyboardType="numeric"
                    />
                  </View>

                  <Button mode='contained' onPress={async()=> {
                    try {
                      const solAmountToConvert: BN = convertSmallCountToLamport(Number(solToBuy))
                      const solAmountBefore: BN = convertSmallCountToLamport(Number(solBefore))
                      const res = await convertSolanaToTokenNoFee_Rust({input_sol_lamp: solAmountToConvert, before_sol_lamp:solAmountBefore})
                      const res2 = await convertSolanaToTokenNoFee_Rust({input_sol_lamp: solAmountToConvert, before_sol_lamp:solAmountBefore})
                      const tokenAmount = convertDecimalToToken(res).toFixed(0)
                      const tokenAmount2 = convertDecimalToToken(res2).toFixed(0)
                      setCalculatedTokenAmount(tokenAmount+ "\n("+formatNumberCompact(Number(tokenAmount))+")")
                      setCalculatedTokenAmount2(tokenAmount2+ "\n("+formatNumberCompact(Number(tokenAmount2))+")")
                    } catch (error) {
                      console.log("error", error)
                    }
                  }} style={styles.smallInput}>=</Button>
                  <View style={styles.smallInput}>
                    <Text>Tokens</Text>
                    <Text style={{height: 56, backgroundColor: 'black', alignItems:'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center'}}>{calculatedTokenAmount}</Text>
                  </View>
                  
                  <View style={styles.smallInput}>
                    <Text>Tokens2</Text>
                    <Text style={{height: 56, backgroundColor: 'black', alignItems:'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center'}}>{calculatedTokenAmount2}</Text>
                  </View>
                </View>

              </View>
            </>
          )}

          {tab === "format" && (
            <>
              <Text style={styles.groupTitle}>formatNumberCompact:</Text>
              <TextInput
                label="Number to format"
                value={fmtIn ?? ""}
                onChangeText={makeSafeOnChange(setFmtIn)}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <HelperText type="info" visible>
                {`→ ${fmtResult}`}
              </HelperText>
            </>
          )}

          {tab === "time" && (
            <>
              <TextInput
                label="Timestamp (sec or ms)"
                value={tsIn ?? ""}
                onChangeText={makeSafeOnChange(setTsIn)}
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
            </>
          )}
        </View>

        {/* LEFT: Guide & quick checks */}
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Как пользоваться
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Выбери нужный таб сверху, меняй параметры и смотри результаты. Значения с плавающей точкой
            автоматически переводятся в BN с нужной точностью (9 или 6 знаков).
          </Text>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Быстрые Presets</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <Button mode="contained" onPress={onReset}>
              Reset
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  controls: {
    flex: 4,
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
    width: '100%',
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowStart: {
    gap: 10,
    maxWidth: 600,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-start',
  },
  smallInput: {
    maxWidth: 100,
  },
});