// ConvertWithFeePlaygroundScreen.tsx
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, TextInput, Button, Divider, IconButton } from "react-native-paper";
import { BN } from "@coral-xyz/anchor";
import { convertSolanaToTokenWithFeeWithParams } from "@services/pumpfun/convertors";
import { convertLamportToSmallCount } from "@utils/premarket";

type RowState = {
  id: string;
  inputSolLamp: string;      // строка для ввода
  beforeSolLamp: string;     // строка для ввода (опционально)
  result?: BN | null;
  error?: string | null;
};

function formatBigNumberLike(value: unknown): string {
  let str: string;

  if (BN.isBN(value as any)) {
    str = (value as BN).toString(10);
  } else if (typeof value === "number" || typeof value === "bigint") {
    str = String(value);
  } else if (typeof value === "string") {
    str = value;
  } else if (Array.isArray(value) || (value && typeof value === "object")) {
    str = JSON.stringify(value, (k, v) => {
      if (BN.isBN(v)) return (v as BN).toString(10);
      return v;
    });
  } else if (value == null) {
    str = "";
  } else {
    str = String(value);
  }

  return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parseBNString(input: string): BN | null {
  const cleaned = input.replace(/[\s,_]/g, "");
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return null;
  return new BN(cleaned, 10);
}

function createRow(): RowState {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    inputSolLamp: "",
    beforeSolLamp: "",
    result: undefined,
    error: null,
  };
}

export default function ConvertWithFeePlaygroundScreen() {
  // SETTINGS
  const [pumpfunFee, setPumpfunFee] = useState<string>("100");      // пример: 100 = 1.00% (зависит от твоей логики)
  const [pumpfunPoints, setPumpfunPoints] = useState<string>("0");
  const [vS0, setVS0] = useState<string>("0");
  const [vT0, setVT0] = useState<string>("0");

  // TABLE ROWS
  const [rows, setRows] = useState<RowState[]>([createRow()]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const handleChangeRowField = (id: string, field: keyof RowState, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              // при изменении входных значений сбрасываем старый результат/ошибку
              ...(field === "inputSolLamp" || field === "beforeSolLamp"
                ? { result: undefined, error: null }
                : {}),
            }
          : row
      )
    );
  };

  const handleCalculateAll = () => {
    // парсим настройки
    const feeNum = Number(pumpfunFee);
    const pointsNum = Number(pumpfunPoints);

    if (!isFinite(feeNum) || !isFinite(pointsNum)) {
      // просто кинем общую ошибку в каждую строку
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          error: "Неверные значения fee/points",
          result: undefined,
        }))
      );
      return;
    }

    setRows((prev) =>
      prev.map((row) => {
        // парсим input_sol_lamp
        const inBN = parseBNString(row.inputSolLamp);
        if (!inBN) {
          return {
            ...row,
            error: "input_sol_lamp: введите неотрицательное целое число (лампорты)",
            result: undefined,
          };
        }

        // парсим before_sol_lamp (опционально)
        const beforeBN = parseBNString(row.beforeSolLamp || "");
        let result: BN | null = null;
        let error: string | null = null;

        try {
          result = convertSolanaToTokenWithFeeWithParams(
            {
              input_sol_lamp: inBN,
              before_sol_lamp: beforeBN || undefined,
            },
            {
              pumpfunFee: feeNum,
              pumpfunPoints: pointsNum,
              vS0,
              vT0,
            }
          );
        } catch (e: any) {
          error = e?.message ?? "Ошибка при вычислении";
          result = null;
        }

        return {
          ...row,
          result,
          error,
        };
      })
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: 'grey'}}
    >
      <Text style={{ fontSize: 20, marginBottom: 4 }}>
        🧪 convertSolanaToTokenWithFeeWithParams Playground
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Тестовый экран для локальной функции. Все значения — в лампортах / сырых числах.
      </Text>

      {/* SETTINGS */}
      <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#555", gap: 8 }}>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>Settings</Text>
        <Divider />

        <TextInput
          label="pumpfunFee"
          value={pumpfunFee}
          onChangeText={setPumpfunFee}
          keyboardType="numeric"
          autoCorrect={false}
        />

        <TextInput
          label="pumpfunPoints"
          value={pumpfunPoints}
          onChangeText={setPumpfunPoints}
          keyboardType="numeric"
          autoCorrect={false}
        />
        <Text>Pumpfun comission:   {(100 * (Number(pumpfunFee)) / Number(pumpfunPoints)).toFixed(2)}%</Text>

        <TextInput
          label="vS0"
          value={vS0}
          onChangeText={setVS0}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="vT0"
          value={vT0}
          onChangeText={setVT0}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* TABLE HEADER */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 4,
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        <View style={{ flex: 0.3 }}>
          <Text variant="labelMedium"># / Actions</Text>
        </View>
        <View style={{ flex: 0.9 }}>
          <Text variant="labelMedium">input_sol_lamp</Text>
        </View>
        <View style={{ flex: 0.9 }}>
          <Text variant="labelMedium">before_sol_lamp (optional)</Text>
        </View>
        <View style={{ flex: 1.1 }}>
          <Text variant="labelMedium">Result</Text>
        </View>
      </View>

      <Divider />

      {/* ROWS */}
      {rows.map((row, index) => (
        <View
          key={row.id}
          style={{
            flexDirection: "column",
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#444",
            gap: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4 }}>
            {/* Index + remove button */}
            <View style={{ flex: 0.3, alignItems: "center" }}>
              <Text>{index + 1}</Text>
              <IconButton
                icon="delete"
                size={18}
                onPress={() => handleRemoveRow(row.id)}
                disabled={rows.length === 1}
              />
            </View>

            {/* input_sol_lamp */}
            <View style={{ flex: 0.9 }}>
              <TextInput
                label="input_sol_lamp"
                value={row.inputSolLamp}
                onChangeText={(text) => handleChangeRowField(row.id, "inputSolLamp", text)}
                keyboardType="numeric"
                autoCorrect={false}
              />
              <Text>{convertLamportToSmallCount(new BN(row.inputSolLamp))} </Text>
            </View>

            {/* before_sol_lamp */}
            <View style={{ flex: 0.9 }}>
              <TextInput
                label="before_sol_lamp"
                value={row.beforeSolLamp}
                onChangeText={(text) => handleChangeRowField(row.id, "beforeSolLamp", text)}
                keyboardType="numeric"
                autoCorrect={false}
              />
            </View>

            {/* Result */}
            <View style={{ flex: 1.1, paddingHorizontal: 4 }}>
              {row.error ? (
                <Text style={{ color: "red" }} numberOfLines={3}>
                  {row.error}
                </Text>
              ) : row.result !== undefined ? (
                <>
                  <Text numberOfLines={1}>raw: {row.result?.toString(10) ?? "-"}</Text>
                  <Text numberOfLines={2} variant="bodySmall">
                    formatted: {row.result ? formatBigNumberLike(row.result) : "-"}
                  </Text>
                </>
              ) : (
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Нажми "Calculate for all"
                </Text>
              )}
            </View>
          </View>
        </View>
      ))}

      {/* ACTIONS */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Button mode="contained" onPress={handleCalculateAll}>
          Calculate for all rows
        </Button>
        <Button mode="outlined" onPress={handleAddRow}>
          Add row
        </Button>
      </View>
    </ScrollView>
  );
}
