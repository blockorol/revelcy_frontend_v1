import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { PremarketCard } from "@components/premarket/PremarketCard";
import { TokenMainInfo } from "@api/token";
import { PublicKey } from "@solana/web3.js";
import { convertSmallCountToLamport } from "@utils/premarket";

export default function PremarketCardExampleScreen() {
  const nowSec = Math.floor(Date.now() / 1000);

  // Base
  const [name, setName] = useState("MemeMaster");
  const [symbol, setSymbol] = useState("MEME");
  const [pubkey, setPubkey] = useState<PublicKey>(new PublicKey("GjXtStopbuYP37t16umnwerN4eyPhMmc127zrLSv5Bnq"));

  // State
  const [state, setState] = useState<"premarket" | "canceled" | "finished">("premarket");

  // Image
  const [hasImage, setHasImage] = useState(false);
  const [imageURL, setImageURL] = useState("https://i.imgur.com/KZsmUi2l.png");

  // Goal / Raised
  const [goalSOL, setGoalSOL] = useState(4.0);
  const [raisedSOL, setRaisedSOL] = useState<number|undefined>(2.0);

  // Time controls
  const [deadlineInHours, setDeadlineInHours] = useState(72);  // через N часов
  const [createdAgoHours, setCreatedAgoHours] = useState(1);   // N часов назад

  // Links
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  const mainInfo: TokenMainInfo = useMemo(
    () => ({
      id: "tok1",
      premarketPubkey: pubkey,
      name,
      description: "Short description for preview purposes",
      symbol,
      imageURL: hasImage ? imageURL : undefined,
      ipfsURI: "",
      links: {
        telegram: telegram || undefined,
        twitter: twitter || undefined,
        webSite: website || undefined,
      },
      premarketGoalSolLamp: convertSmallCountToLamport(goalSOL), // BN-совместимая заглушка
      premarketDeadline: nowSec + Math.max(0, Math.round(deadlineInHours * 3600)),
      premarketCreated: nowSec - Math.max(0, Math.round(createdAgoHours * 3600)),
      createdByPubkey: "CreatorPubkey",
      state,
    }),
    [
      pubkey,
      name,
      symbol,
      hasImage,
      imageURL,
      telegram,
      twitter,
      website,
      goalSOL,
      deadlineInHours,
      createdAgoHours,
      nowSec,
      state,
    ]
  );

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🧪 PremarketCard Playground</Text>

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Preview */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <PremarketCard
            mainInfo={mainInfo}
            raisedLamports={raisedSOL?Math.max(0, Math.round(raisedSOL * 1_000_000_000)):undefined}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Name & Symbol */}
          <Text style={styles.groupTitle}>Base</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} />
          <Text style={styles.label}>Symbol</Text>
          <TextInput value={symbol} onChangeText={setSymbol} />
          <Text style={styles.label}>Premarket Pubkey</Text>
          <TextInput value={pubkey.toString()} onChangeText={
            (t)=>{
                try {
                    const k = new PublicKey(t)
                    setPubkey(k)
                } catch {}
            }} autoCapitalize="none" />

          {/* State */}
          <Text style={styles.groupTitle}>State</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Button mode={state === "premarket" ? "contained" : "outlined"} onPress={() => setState("premarket")}>
              premarket
            </Button>
            <Button mode={state === "finished" ? "contained" : "outlined"} onPress={() => setState("finished")}>
              finished
            </Button>
            <Button mode={state === "canceled" ? "contained" : "outlined"} onPress={() => setState("canceled")}>
              canceled
            </Button>
          </View>

          {/* Image */}
          <Text style={styles.groupTitle}>Image</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button mode={hasImage ? "contained" : "outlined"} onPress={() => setHasImage((v) => !v)}>
              {hasImage ? "remove image" : "add image"}
            </Button>
          </View>
          {hasImage && (
            <>
              <Text style={styles.label}>Image URL</Text>
              <TextInput value={imageURL} onChangeText={setImageURL} autoCapitalize="none" />
            </>
          )}

          {/* Goal / Raised */}
          <Text style={styles.groupTitle}>Funding</Text>
          <Text style={styles.label}>Goal (SOL): {goalSOL.toFixed(1)}</Text>
          <Slider value={goalSOL} minimumValue={0} maximumValue={50} step={0.1} onValueChange={setGoalSOL} />
          <Text style={styles.label}>Raised (SOL): {raisedSOL?raisedSOL.toFixed(1):"None"}</Text>
          <Slider value={raisedSOL} minimumValue={0} maximumValue={50} step={0.1} onValueChange={setRaisedSOL} />
          <Button onPress={()=>setRaisedSOL(undefined)}>Without Raised info</Button>

          {/* Time */}
          <Text style={styles.groupTitle}>Time</Text>
          <Text style={styles.label}>Deadline in (hours): {deadlineInHours}</Text>
          <Slider value={deadlineInHours} minimumValue={0} maximumValue={24 * 14} step={1} onValueChange={setDeadlineInHours} />
          <Text style={styles.label}>Created ago (hours): {createdAgoHours}</Text>
          <Slider value={createdAgoHours} minimumValue={0} maximumValue={24 * 30} step={1} onValueChange={setCreatedAgoHours} />

          {/* Links */}
          <Text style={styles.groupTitle}>Links</Text>
          <Text style={styles.label}>Telegram</Text>
          <TextInput value={telegram} onChangeText={setTelegram} autoCapitalize="none" placeholder="https://t.me/..." />
          <Text style={styles.label}>Twitter/X</Text>
          <TextInput value={twitter} onChangeText={setTwitter} autoCapitalize="none" placeholder="https://x.com/..." />
          <Text style={styles.label}>Website</Text>
          <TextInput value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="https://..." />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  controls: {
    width: 320,
    marginLeft: 16,
    paddingBottom: 100,
  },
  groupTitle: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#666",
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
});
