// PremarketBondingCurvePlayground.tsx
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, TextInput, Button, Switch, useTheme, Divider } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

import { PremarketBondingCurve, Joiner } from "@components/premarket/PremarketBondingCurve";
import { convertSmallCountToLamport } from "@utils/premarket";

export default function PremarketBondingCurvePlayground() {
  const theme = useTheme();

  const [withJoinButton, setWithJoinButton] = useState(true);
  const [goalPercent, setGoalPercent] = useState(80);
  const [nowPercent, setNowPercent] = useState(50);
  const [currentPrice, setCurrentPrice] = useState(0.00123);
  const [background, setBackground] = useState<string | undefined>(undefined);
  const [maxSolDisplayed, setMaxSolDisplayed] = useState(100);
  const [width, setWidth] = useState(347);
  const [height, setHeight] = useState(222);

  const [joiners, setJoiners] = useState<Joiner[]>([
    {
      id: "j1",
      amount_sol_lamp: convertSmallCountToLamport(1),
      amount_sol_cumulative_lamp: convertSmallCountToLamport(1),
      user_url: "https://avatars.githubusercontent.com/u/1?v=4",
    },
    {
      id: "j2",
      amount_sol_lamp: convertSmallCountToLamport(2),
      amount_sol_cumulative_lamp: convertSmallCountToLamport(3),
    },
  ]);

  const premaketPubkey = new PublicKey("11111111111111111111111111111111");

  // --- Add Joiner form ---
  const [newJoinerId, setNewJoinerId] = useState(`j${joiners.length + 1}`);
  const [newJoinerSol, setNewJoinerSol] = useState("1");
  const [newJoinerUrl, setNewJoinerUrl] = useState("");

  const addJoiner = () => {
    const solNum = parseFloat(newJoinerSol);
    if (isNaN(solNum) || solNum <= 0) return;

    const amountBN = convertSmallCountToLamport(solNum);
    const cumulative = joiners.reduce(
      (acc, j) => acc.add(j.amount_sol_lamp),
      new BN(0)
    ).add(amountBN);

    const newJoiner: Joiner = {
      id: newJoinerId || `j${joiners.length + 1}`,
      amount_sol_lamp: amountBN,
      amount_sol_cumulative_lamp: cumulative,
      user_url: newJoinerUrl || undefined,
    };

    setJoiners((prev) => [...prev, newJoiner]);

    // сброс формы
    setNewJoinerId(`j${joiners.length + 2}`);
    setNewJoinerSol("1");
    setNewJoinerUrl("");
  };

  const removeJoiner = (id: string) => {
    setJoiners((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <ScrollView style={{ padding: 16, backgroundColor: theme.colors.surface }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>🧪 PremarketBondingCurve Playground</Text>

      {/* Component under test */}
      <PremarketBondingCurve
        onUpdated={async()=>{}}
        premaketPubkey={premaketPubkey}
        withJoinButton={withJoinButton}
        goalPercent={goalPercent}
        nowPercent={nowPercent}
        currentPrice={currentPrice}
        joiners={joiners}
        background={background}
        maxSolDisplayed={maxSolDisplayed}
        width={width}
        height={height}
      />

      {/* Controls */}
      <View style={{ marginBottom: 16 }}>
        <Text>With Join Button</Text>
        <Switch value={withJoinButton} onValueChange={setWithJoinButton} />
      </View>

      <Text>Goal Percent: {goalPercent}%</Text>
      <Slider value={goalPercent} minimumValue={0} maximumValue={100} step={1} onValueChange={setGoalPercent as (v: number) => void} />
      <Divider style={{ marginVertical: 8 }} />

      <Text>Now Percent: {nowPercent}%</Text>
      <Slider value={nowPercent} minimumValue={0} maximumValue={100} step={1} onValueChange={setNowPercent as (v: number) => void} />
      <Divider style={{ marginVertical: 8 }} />

      <Text>Current Price: {currentPrice}</Text>
      <TextInput mode="outlined" value={String(currentPrice)} onChangeText={(t) => setCurrentPrice(parseFloat(t) || 0)} keyboardType="numeric" />
      <Divider style={{ marginVertical: 8 }} />

      <Text>Max SOL displayed: {maxSolDisplayed}</Text>
      <Slider value={maxSolDisplayed} minimumValue={10} maximumValue={1000} step={10} onValueChange={setMaxSolDisplayed as (v: number) => void} />
      <Divider style={{ marginVertical: 8 }} />

      <Text>Canvas width / height</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput style={{ flex: 1 }} mode="outlined" value={String(width)} onChangeText={(t) => setWidth(parseInt(t) || 0)} keyboardType="numeric" label="Width" />
        <TextInput style={{ flex: 1 }} mode="outlined" value={String(height)} onChangeText={(t) => setHeight(parseInt(t) || 0)} keyboardType="numeric" label="Height" />
      </View>

      <Divider style={{ marginVertical: 16 }} />

      {/* Add Joiner Form */}
      <Text variant="titleMedium">Add Joiner</Text>
      <TextInput label="ID" mode="outlined" value={newJoinerId} onChangeText={setNewJoinerId} style={{ marginTop: 8 }} />
      <TextInput label="Amount (SOL)" mode="outlined" value={newJoinerSol} onChangeText={setNewJoinerSol} keyboardType="numeric" style={{ marginTop: 8 }} />
      <TextInput label="User URL" mode="outlined" value={newJoinerUrl} onChangeText={setNewJoinerUrl} style={{ marginTop: 8 }} />

      <Button mode="contained" onPress={addJoiner} style={{ marginTop: 12 }}>
        + Add Joiner
      </Button>

      <Divider style={{ marginVertical: 16 }} />

      {/* Joiner List */}
      <View style={{ marginTop: 12 }}>
        <Text variant="titleMedium">Joiners:</Text>
        {joiners.map((j) => (
          <View
            key={j.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 4,
            }}
          >
            <Text style={{ flex: 1 }}>
              {j.id} | sol={j.amount_sol_lamp.toString()} | cumulative={j.amount_sol_cumulative_lamp.toString()}
            </Text>
            <Button mode="text" onPress={() => removeJoiner(j.id)}>
              Delete
            </Button>
          </View>
        ))}
      </View>

      <Divider style={{ marginVertical: 16 }} />
    </ScrollView>
  );
}
