import React from "react";
import { ScrollView } from "react-native";
import { List, useTheme } from "react-native-paper";
import { useRouter } from "@hooks/useSafeRouter";
import type { RouteItem } from "./routes";

export default function FolderIndex({ title, items }: { title: string; items: RouteItem[] }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <List.Section title={title.toUpperCase()}>
        {items.map((r) => (
          <List.Item
            key={r.href}
            title={r.label}
            description={r.href}
            left={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => router.push(r.href as any)}
            style={{ backgroundColor: theme.colors.surface }}
          />
        ))}
      </List.Section>
    </ScrollView>
  );
}
