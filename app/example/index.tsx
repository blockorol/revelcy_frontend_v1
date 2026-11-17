import { ScrollView } from "react-native";
import { List, Text,  Divider, useTheme } from "react-native-paper";
import { useRouter } from "@hooks/useSafeRouter";
import { getAllRoutes } from "./routes";
import { useNetwork } from "@providers/NetworkContext";

export default function ExampleIndex() {
  const router = useRouter();
  const theme = useTheme();
  const groups = getAllRoutes();
  const {network} = useNetwork();

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant='bodyMedium' style={{color: 'black'}}> Version 0.1.4; network: {network.toString()}</Text>
      
      <List.Section title="EXAMPLE — PAGES">
        {groups.map(({ section, routes }, idx) => (
          <List.Accordion
            key={section}
            title={section.toUpperCase()}
            left={(p) => <List.Icon {...p} icon="folder" />}
          >
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
