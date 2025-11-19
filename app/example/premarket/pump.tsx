// TokenMathPlaygroundScreen.tsx
import { useEffect, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Divider } from "react-native-paper";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { getSolanaConnection } from "@services/blockchain/solana";
import {
  Global,
  BondingCurve,
  FeeConfig,
  getBuySolAmountFromTokenAmount,
  OnlinePumpSdk,
} from "@pump-fun/pump-sdk";

const connection = getSolanaConnection("mainnet-beta");
const onlineSdk = new OnlinePumpSdk(connection);

function formatBigNumberLike(value: unknown): string {
  let str: string;

  if (BN.isBN(value as any)) {
    str = (value as BN).toString(10);
  } else if (typeof value === "number" || typeof value === "bigint") {
    str = String(value);
  } else if (typeof value === "string") {
    str = value;
  } else if (Array.isArray(value) || (value && typeof value === "object")) {
    // Для вложенных объектов делаем компактный JSON
    str = JSON.stringify(value, (k, v) => {
      if (BN.isBN(v)) return (v as BN).toString(10);
      return v;
    });
  } else if (value == null) {
    str = "";
  } else {
    str = String(value);
  }

  // Разбиение на разряды
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function renderObjectFields(obj: any | null, title: string) {
  if (!obj) return null;

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{title}</Text>
      <Divider style={{ marginBottom: 8 }} />
      {Object.entries(obj).map(([key, value]) => (
        <View key={key} style={{ marginBottom: 4 }}>
          <Text>
            {key}: {formatBigNumberLike(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function TokenMathPlaygroundScreen() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [solAmount, setSolAmount] = useState<string>("0"); // ввод в SOL
  const amountLamport = useRef<BN>(new BN(0));

  const [global, setGlobal] = useState<Global | null>(null);
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);
  const [bondingCurve, setBondingCurve] = useState<BondingCurve | null>(null);

  const [buyAmount, setBuyAmount] = useState<BN | null>(null);

  const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);
  const [loadingBonding, setLoadingBonding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем global и feeConfig только один раз
  useEffect(() => {
    let cancelled = false;

    const loadBaseData = async () => {
      try {
        setLoadingGlobal(true);
        const [g, f] = await Promise.all([
          onlineSdk.fetchGlobal(),
          onlineSdk.fetchFeeConfig(),
        ]);
        if (!cancelled) {
          setGlobal(g);
          setFeeConfig(f);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to fetch global/feeConfig");
        }
      } finally {
        if (!cancelled) {
          setLoadingGlobal(false);
        }
      }
    };

    loadBaseData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSolAmountChange = (text: string) => {
    setSolAmount(text);
    const normalized = text.replace(",", "."); // на всякий случай
    const num = parseFloat(normalized);
    if (!isNaN(num) && num >= 0) {
      // конвертация SOL → лампорты
      const lamports = Math.round(num * LAMPORTS_PER_SOL);
      amountLamport.current = new BN(lamports);
    } else {
      amountLamport.current = new BN(0);
    }
  };

  const handleLoadBondingCurve = async () => {
    setError(null);
    setBuyAmount(null);

    const addr = tokenAddress.trim();
    if (!addr) {
      setError("Введите адрес токена");
      return;
    }

    try {
      setLoadingBonding(true);
      const bc = await onlineSdk.fetchBondingCurve(addr);
      setBondingCurve(bc);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch bonding curve");
      setBondingCurve(null);
    } finally {
      setLoadingBonding(false);
    }
  };

  const handleCalculateBuy = () => {
    setError(null);

    if (!global || !feeConfig) {
      setError("Global и FeeConfig еще не загружены");
      return;
    }
    if (!bondingCurve) {
      setError("Сначала загрузите bonding curve по адресу токена");
      return;
    }

    try {
      const result = getBuySolAmountFromTokenAmount({
        global,
        feeConfig,
        bondingCurve,
        mintSupply: bondingCurve.tokenTotalSupply, // 👈 берём из BondingCurve
        amount: amountLamport.current,
      });
      setBuyAmount(result);
    } catch (e: any) {
      setError(e?.message ?? "Failed to calculate buy amount");
      setBuyAmount(null);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: "grey" }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        🧪 Token Math Playground
      </Text>

      {/* Ввод данных */}
      <View style={{ gap: 12, marginBottom: 16 }}>
        <TextInput
          label="Token address"
          value={tokenAddress}
          onChangeText={setTokenAddress}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ backgroundColor: "gray", color: "black" }} // 👈 текст чёрный
        />

        <TextInput
          label="Amount in SOL (будет конвертировано в lamports)"
          value={solAmount}
          onChangeText={handleSolAmountChange}
          keyboardType="decimal-pad"
          style={{ backgroundColor: "gray", color: "black" }} // 👈 текст чёрный
        />

        <Text>
          Текущее значение в lamports:{" "}
          {formatBigNumberLike(amountLamport.current)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Button
            mode="contained"
            onPress={handleLoadBondingCurve}
            loading={loadingBonding}
          >
            Загрузить Bonding Curve
          </Button>

          <Button
            mode="outlined"
            onPress={handleCalculateBuy}
            disabled={!bondingCurve}
          >
            Посчитать buy amount
          </Button>
        </View>
      </View>

      {loadingGlobal && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator />
          <Text>Загрузка global / feeConfig…</Text>
        </View>
      )}

      {error && (
        <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
      )}

      {buyAmount && (
        <View style={{ marginTop: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16 }}>
            Buy amount {buyAmount.toString()} (в Decem, в лампортах): {formatBigNumberLike(buyAmount)}
          </Text>
        </View>
      )}

      {/* Вывод global, feeConfig и bondingCurve */}
      {renderObjectFields(global, "Global")}
      {renderObjectFields(feeConfig, "FeeConfig")}
      {renderObjectFields(bondingCurve, "BondingCurve")}
    </ScrollView>
  );
}
