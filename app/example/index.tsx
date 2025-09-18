import React from "react";
import { ScrollView } from "react-native";
import { List, Divider, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { getAllRoutes } from "./routes";

export default function ExampleIndex() {
  const router = useRouter();
  const theme = useTheme();
  const groups = getAllRoutes();

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <List.Section title="EXAMPLE — PAGES">
        {groups.map(({ section, routes }, idx) => (
          <List.Accordion
            key={section}
            title={section.toUpperCase()}
            left={(p) => <List.Icon {...p} icon="folder" />}
          >
            {/* ссылка на индекс подпапки */}
            <List.Item
              title="— Открыть индекс подпапки —"
              left={(p) => <List.Icon {...p} icon="folder-outline" />}
              onPress={() => router.push(`/example/${section}` as any)}
              style={{ backgroundColor: theme.colors.surface }}
            />
            <Divider />
            {routes.map((r) => (
              <List.Item
                key={r.href}
                title={r.label}
                description={r.href}
                left={(p) => <List.Icon {...p} icon="file-outline" />}
                onPress={() => router.push(r.href as any)}
                style={{ backgroundColor: theme.colors.surface }}
              />
            ))}
          </List.Accordion>
        ))}
      </List.Section>
    </ScrollView>
  );
}
