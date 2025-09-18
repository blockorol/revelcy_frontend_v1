// screens/TextDemo.tsx
import * as React from "react";
import { ScrollView, View, StyleSheet, TextStyle } from "react-native";
import { Text as PaperText, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import type { AppTheme } from "@theme/types";

type BaseTextProps = React.ComponentProps<typeof PaperText>;
type Variant = NonNullable<BaseTextProps["variant"]>;

const groups: { title: string; variants: Variant[] }[] = [
  { title: "Display",  variants: ["displayLarge", "displayMedium", "displaySmall"] },
  { title: "Headline", variants: ["headlineLarge", "headlineMedium", "headlineSmall"] },
  { title: "Title",    variants: ["titleLarge", "titleMedium", "titleSmall"] },
  { title: "Body",     variants: ["bodyLarge", "bodyMedium", "bodySmall"] },
  { title: "Label",    variants: ["labelLarge", "labelMedium", "labelSmall"] },
];

export default function TextDemo() {
  const theme = useTheme<AppTheme>();
  const c = theme.colors;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }}>
      <Text variant="titleLarge" style={styles.pageTitle}>
        Typography — Base vs Prominent
      </Text>

      <View style={styles.container}>
        {groups.map((g) => (
          <Section key={g.title} title={g.title} variants={g.variants} />
        ))}
      </View>
    </ScrollView>
  );
}

function Section({ title, variants }: { title: string; variants: Variant[] }) {
  const theme = useTheme<AppTheme>();
  const c = theme.colors;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.outline }]}>
      <Text variant="labelMedium" style={[styles.cardTitle, { color: c.onSurfaceVariant }]}>
        {title}
      </Text>

      {/* Заголовок таблицы */}
      <View style={styles.headerRow}>
        <Text variant="labelSmall" style={[styles.headerCellText, { color: c.onSurfaceVariant }]}>
          Base
        </Text>
        <Text variant="labelSmall" style={[styles.headerCellText, { color: c.onSurfaceVariant }]}>
          Prominent
        </Text>
      </View>

      {/* Строки: Large / Medium / Small */}
      {variants.map((v) => (
        <TableRow key={v} variant={v} />
      ))}
    </View>
  );
}

function TableRow({ variant }: { variant: Variant }) {
  const theme = useTheme<AppTheme>();
  const c = theme.colors;

  const base = theme.fonts[variant];
  const prom = theme.fontsProminent[variant];

  return (
    <View style={styles.row}>
      {/* Ячейка Base */}
      <View style={[styles.cell, { borderColor: c.outline }]}>
        <Text variant={variant} style={{ color: c.onSurface }}>
          {sampleText(variant)}
        </Text>
        <Spec t={base} />
      </View>

      {/* Ячейка Prominent */}
      <View style={[styles.cell, { borderColor: c.outline }]}>
        <Text variant={variant} prominent style={{ color: c.onSurface }}>
          {sampleText(variant)}
        </Text>
        <Spec t={prom} />
      </View>
    </View>
  );
}

/** мини-спека под образцом */
function Spec({ t }: { t?: Partial<TextStyle> }) {
  const theme = useTheme<AppTheme>();
  return (
    <Text
      variant="labelSmall"
      style={{ opacity: 0.7, marginTop: 4, color: theme.colors.onSurfaceVariant }}
    >
      {fmtSpec(t)}
    </Text>
  );
}

function fmtSpec(t?: Partial<TextStyle>) {
  if (!t) return "—";
  const fs = t.fontSize ?? "—";
  const lh = t.lineHeight ?? "—";
  const ls = t.letterSpacing ?? "—";
  const fw = t.fontWeight ?? "—";
  const ff = t.fontFamily ?? "—";
  return `size ${fs} / line ${lh} / ls ${ls} / weight ${fw} / ${ff}`;
}

function labelOf(v: Variant) {
  // "displayLarge" -> "Large", "titleSmall" -> "Small"
  return v.replace(/^(display|headline|title|body|label)/, "").replace(/^./, (s) => s.toUpperCase());
}

function sampleText(v: Variant) {
  const family = v.match(/^(display|headline|title|body|label)/)?.[1] ?? "Text";
  const size = labelOf(v);
  return `${capitalize(family)} ${size}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  pageTitle: { margin: 16 },
  container: { gap: 16, paddingHorizontal: 16, paddingBottom: 24 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1 },
  cardTitle: { marginBottom: 8 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerSpacer: { width: 90 }, // под место для левой метки строки
  headerCellText: { flex:1, textAlign: "center" },

  row: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  rowLabel: { width: 90, alignSelf: "center" },

  cell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 64,
    justifyContent: "center",
  },
});
