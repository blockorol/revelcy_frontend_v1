import * as React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import type { AppTheme, ExtendedMD3Colors } from "@theme/types";

type Cell = { label: string; bg: string; fg: string; vr?: string };
type Section = { title?: string; rows: Cell[][] };

export default function ColorRolesDemo() {
  const theme = useTheme<AppTheme>();
  const c = theme.colors as ExtendedMD3Colors

  const sections: Section[] = [
    
    {
      title: "Вне схемы",
      rows: [
        [
          { label: "Pink", bg: c.pink, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Yellow", bg: c.yellow, fg: c.onSurface, vr: c.onSurfaceVariant },
        ],
      ],
    },
    {
      title: "Базовые роли",
      rows: [
        [
          { label: "Primary", bg: c.primary, fg: c.onPrimary },
          { label: "Secondary", bg: c.secondary, fg: c.onSecondary },
          { label: "Tertiary", bg: c.tertiary, fg: c.onTertiary },
          { label: "Error", bg: c.error, fg: c.onError },
        ],
        [
          { label: "Primary Container", bg: c.primaryContainer, fg: c.onPrimaryContainer },
          { label: "Secondary Container", bg: c.secondaryContainer, fg: c.onSecondaryContainer },
          { label: "Tertiary Container", bg: c.tertiaryContainer, fg: c.onTertiaryContainer },
          { label: "Error Container", bg: c.errorContainer, fg: c.onErrorContainer },
        ],
      ],
    },

    {
      title: "Fixed",
      rows: [
        [
          { label: "Primary Fixed", bg: c.primaryFixed, fg: c.onPrimaryFixed, vr: c.onPrimaryFixedVariant },
          { label: "Secondary Fixed", bg: c.secondaryFixed, fg: c.onSecondaryFixed, vr: c.onSecondaryFixedVariant },
          { label: "Tertiary Fixed", bg: c.tertiaryFixed, fg: c.onTertiaryFixed, vr: c.onTertiaryFixedVariant },
        ],
        [
          { label: "Primary Fixed Dim", bg: c.primaryFixedDim, fg: c.onPrimaryFixed, vr: c.onPrimaryFixedVariant },
          { label: "Secondary Fixed Dim", bg: c.secondaryFixedDim, fg: c.onSecondaryFixed, vr: c.onSecondaryFixedVariant },
          { label: "Tertiary Fixed Dim", bg: c.tertiaryFixedDim, fg: c.onTertiaryFixed, vr: c.onTertiaryFixedVariant },
        ],
      ],
    },

    {
      title: "Поверхности",
      rows: [
        [
          { label: "Surface Dim", bg: c.surfaceDim, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface", bg: c.surface, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface Bright", bg: c.surfaceBright, fg: c.onSurface, vr: c.onSurfaceVariant },
        ],
        [
          { label: "Surface Container Lowest", bg: c.surfaceContainerLowest, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface Container Low", bg: c.surfaceContainerLow, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface Container", bg: c.surfaceContainer, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface Container High", bg: c.surfaceContainerHigh, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Surface Container Highest", bg: c.surfaceContainerHighest, fg: c.onSurface, vr: c.onSurfaceVariant },
        ],
        [
          { label: "Outline", bg: c.outline, fg: c.surface, vr: c.onSurfaceVariant },
          { label: "Outline Variant", bg: c.outlineVariant, fg: c.surface , vr: c.onSurfaceVariant},
        ],
      ],
    },

    {
      title: "Inverse + служебные",
      rows: [
        [
          { label: "Inverse Surface", bg: c.inverseSurface, fg: c.inverseOnSurface },
          { label: "Inverse Primary", bg: c.inversePrimary, fg: c.onPrimary },
        ],
        [
          { label: "Surface", bg: c.surface, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "Scrim", bg: c.scrim, fg: c.onSurface, vr: c.onSurfaceVariant },
          { label: "Shadow", bg: c.shadow, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "Background", bg: c.background, fg: c.onBackground, vr: c.onSurfaceVariant },
        ],
      ],
    },
    {
      title: "elevation",
      rows: [
        [
          { label: "elevation 0", bg: c.elevation.level0, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "elevation 1", bg: c.elevation.level1, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "elevation 2", bg: c.elevation.level2, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "elevation 3", bg: c.elevation.level3, fg: c.onSurface , vr: c.onSurfaceVariant},
          { label: "elevation 4", bg: c.elevation.level4, fg: c.onSurface , vr: c.onSurfaceVariant },
        ],
      ],
    },
  ];

  // --- Остальные цвета (всё, что не показано выше) ---
  const usedKeys: Array<keyof ExtendedMD3Colors | string> = [
    // вне схемы
    "pink", "yellow",
    // базовые
    "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
    "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
    "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
    "error", "onError", "errorContainer", "onErrorContainer",
    // поверхности
    "surface", "onSurface", "surfaceVariant", "onSurfaceVariant",
    "surfaceDim", "surfaceBright",
    "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer",
    "surfaceContainerHigh", "surfaceContainerHighest",
    "outline", "outlineVariant",
    "background", "onBackground",
    // инверсии и служебные
    "inverseSurface", "inverseOnSurface", "inversePrimary", "scrim", "shadow",
    // fixed
    "primaryFixed", "onPrimaryFixed", "primaryFixedDim",
    "secondaryFixed", "onSecondaryFixed", "secondaryFixedDim",
    "tertiaryFixed", "onTertiaryFixed", "tertiaryFixedDim",
    // возможные variant-ключи (если добавишь в тему)
    "onPrimaryFixedVariant", "onSecondaryFixedVariant", "onTertiaryFixedVariant",
    // не строка — пропустим всё равно
    "elevation",
  ];

  const toTitle = (k: string) =>
    k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  const restCells: Cell[] = Object.keys(c)
    .filter((k) => !usedKeys.includes(k))
    .filter((k) => typeof (c as any)[k] === "string")
    .map((k) => ({
      label: toTitle(k),
      bg: (c as any)[k] as string,
      fg: c.onSurface,
      vr: c.onSurfaceVariant
    }));

  if (restCells.length) {
    sections.push({ title: "Остальные", rows: [restCells] });
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.title}>MD3 Colors</Text>

      {sections.map((section, si) => (
        <View key={si} style={styles.section}>
          {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
          {section.rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((item, ci) => (
                <View key={ci}>
                  <Text style={{ color: item.bg === "#5e2204ff"?'red':"black" }}>
                    {item.label}: {item.bg === "#5e2204ff" ? "DEFAULT!" : item.bg}
                  </Text>
                  <View style={[styles.cell, { backgroundColor: item.bg }]}>
                    <Text style={[styles.cellText, { color: item.fg }]}>
                      onItem color: {item.fg}
                    </Text>
                    {item.vr && (
                      <Text style={[styles.cellText, { color: item.vr }]}>
                        onItem variant: {item.vr}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "600", margin: 16 },
  section: { marginBottom: 12 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 8, fontSize: 14, opacity: 0.7, color: "black" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginHorizontal: 12, marginBottom: 12 },
  cell: { minWidth: 200, height: 68, borderRadius: 12, padding: 12, justifyContent: "space-between" },
  cellText: { fontSize: 15, fontWeight: "600" },
  hex: { fontSize: 12, opacity: 0.9 },
});
