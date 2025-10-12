// UserModalPlayground.tsx
import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  SegmentedButtons,
  Switch,
  useTheme,
  Divider,
  HelperText,
} from "react-native-paper";
import { Button } from "@components/ui/Button";
import { UserModal } from "@components/user/UserModal";

const PERSONAL_OPTIONS = [
  { label: "Personal (can edit avatar)", value: "true" },
  { label: "Readonly", value: "false" },
] as const;

const DEFAULT_USER = {
  userId: "u_42",
  username: "revelcy_user",
  walletAddress: "7Fojz3q2JfKQ1FQ1gK9VeqxH3QHf8o1j8oPZk9n1", // фейк
  avatarUrl: null as string | null,
};

const UserModalPlayground: React.FC = () => {
  const { colors } = useTheme();

  // Управление пропсами
  const [user, setUser] = useState(DEFAULT_USER);
  const [isPersonalStr, setIsPersonalStr] = useState<"true" | "false">("true");
  const isPersonal = isPersonalStr === "true";

  // Вспомогательные поля
  const [visible, setVisible] = useState(false);
  const [invalidAvatar, setInvalidAvatar] = useState(false);
  const [note, setNote] = useState<string>("");

  // Моки коллбеков
  const updateAvatar = async (uri: string) => {
    // эмулируем обновление профиля
    setUser((u) => ({ ...u, avatarUrl: uri }));
    setNote("Avatar updated");
  };

  const logout = () => {
    setNote("Logged out");
    setVisible(false);
  };

  // Предпросмотр того, что пойдёт в модалку
  const effectiveUser = useMemo(
    () => ({
      ...user,
      avatarUrl: invalidAvatar ? "https://invalid.local/404.png" : user.avatarUrl,
    }),
    [user, invalidAvatar]
  );

  return (
    <ScrollView style={styles.container}>
      {/* Панель управления */}
      <View style={styles.inputsContainer}>
        <Text style={styles.sectionTitle}>Props</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={user.username}
            onChangeText={(v) => setUser((u) => ({ ...u, username: v }))}
            style={styles.input}
            mode="flat"
            placeholder="Username"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Wallet</Text>
          <TextInput
            value={user.walletAddress}
            onChangeText={(v) => setUser((u) => ({ ...u, walletAddress: v }))}
            style={styles.input}
            mode="flat"
            placeholder="Wallet address"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            value={user.avatarUrl ?? ""}
            onChangeText={(v) => setUser((u) => ({ ...u, avatarUrl: v || null }))}
            style={styles.input}
            mode="flat"
            placeholder="https://… (optional)"
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Access</Text>
          <SegmentedButtons
            value={isPersonalStr}
            onValueChange={(v) => setIsPersonalStr(v as "true" | "false")}
            buttons={PERSONAL_OPTIONS as any}
          />
        </View>

        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.switchLabel}>Force avatar error</Text>
          <Switch value={invalidAvatar} onValueChange={setInvalidAvatar} color={colors.primary} />
        </View>

        {!!note && (
          <HelperText type="info" style={{ color: colors.onSurfaceVariant }}>
            {note}
          </HelperText>
        )}
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Кнопки открытия */}
      <Text style={styles.sectionTitle}>Open</Text>
      <View style={styles.preview}>
        <Button variant="secondary" mode="contained" size="normal" onPress={() => setVisible(true)}>
          Open UserModal
        </Button>
      </View>

      {/* Сама модалка */}
      {visible && (
        <UserModal
          user={effectiveUser}
          isPersonal={isPersonal}
          updateAvatar={updateAvatar}
          logout={logout}
          onClose={() => setVisible(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    padding: 16,
  },
  inputsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  label: {
    color: "white",
    fontSize: 14,
    width: 110,
  },
  input: {
    flex: 1,
    backgroundColor: "#555",
    color: "white",
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    color: "white",
    fontSize: 14,
    marginBottom: 4,
  },
  switchLabel: {
    color: "white",
    fontSize: 14,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  preview: {
    backgroundColor: "#444",
    padding: 16,
    borderRadius: 8,
    alignItems: "flex-start",
    gap: 12,
  },
});

export default UserModalPlayground;
