// LoginFlowPlayground.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Switch, Divider, useTheme, SegmentedButtons } from "react-native-paper";
import { Button } from "@components/ui/Button";
import LoginFlow /* , { LoginState } */ from "@components/login/LoginFlow";
import { useOverlay } from "@storage/UniversalOverlayProvider";

// Если LoginState не экспортируется из LoginFlow — раскомментируй enum ниже
export enum LoginState {
  FIRST = "FIRST",
  WALLET_CONNECTING = "WALLET_CONNECTING",
  SET_USER_NAME = "SET_USER_NAME",
  SET_AVATAR = "SET_AVATAR",
}

type OverrideOpt = "none" | LoginState;

const LoginFlowPlayground: React.FC = () => {
  const { colors } = useTheme();
  const [withCloseButton, setWithCloseButton] = useState(true);

  // "none" => проп не передаём (undefined), иначе передаём конкретный LoginState
  const [override, setOverride] = useState<OverrideOpt>("none");

  const { open, close } = useOverlay();

  const openFlow = () => {
    open(
      <LoginFlow
        onCloseButton={withCloseButton ? close : undefined}
        loginFlowStateOverride={override === "none" ? undefined : override}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
      <Text style={styles.title}>LoginFlow Playground</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Show close button</Text>
        <Switch value={withCloseButton} onValueChange={setWithCloseButton} />
      </View>

      <View style={{ gap: 8, marginTop: 12 }}>
        <Text style={styles.label}>Login state override</Text>
        <SegmentedButtons
          value={override}
          onValueChange={(v) => setOverride(v as OverrideOpt)}
          buttons={[
            { value: "none", label: "Auto" },
            { value: LoginState.FIRST, label: "FIRST" },
            { value: LoginState.WALLET_CONNECTING, label: "WALLET" },
            { value: LoginState.SET_USER_NAME, label: "USERNAME" },
            { value: LoginState.SET_AVATAR, label: "AVATAR" },
          ]}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.actions}>
        <Button mode="contained" variant="secondary" size="normal" onPress={openFlow}>
          Open LoginFlow
        </Button>
        <Text style={[styles.note, { color: colors.onSurfaceVariant }]}>
          Override: {override === "none" ? "Auto (undefined)" : override}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333", padding: 16 },
  title: { color: "white", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "white", fontSize: 14 },
  divider: { marginVertical: 12, backgroundColor: "#555" },
  actions: { gap: 8, backgroundColor: "#444", padding: 16, borderRadius: 8, alignItems: "flex-start" },
  note: { fontSize: 12 },
});

export default LoginFlowPlayground;
