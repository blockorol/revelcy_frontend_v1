// NotFoundScreen.tsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 404 */}
        <Image
          source={require("@assets/404_icon.png")}
          style={styles.codeIcon}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
      <Text
        variant="headlineSmall"
        prominent
        style={{ color: colors.onBackground }}
      >
        Page Not Found
      </Text>

      <Text
        variant="bodyMedium"
        style={{
          color: colors.onSurfaceVariant,
        }}
      >
        The page you&apos;re looking for doesn&apos;t seem to exist
      </Text>
      </View>
      <Button
        variant="secondary"
        mode="contained"
        size="normal"
        onPress={() => router.replace("/")}
      >
        Go Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    gap: 40,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    width: '100%',
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  codeIcon: {
    width: 240,
    height: 104,
    maxWidth:'100%',
  },
});
