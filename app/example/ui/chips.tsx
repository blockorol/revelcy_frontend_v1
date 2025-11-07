// AllChipsScreen.tsx
import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, SegmentedButtons, Switch, useTheme, Divider } from "react-native-paper";
import { ChipDisplay } from "@components/ui/Chip";

type Variant = "primary" | "secondary" | "error";
type Size = "normal" | "small";
type Mode = "outlined" | "flat";

const VARIANTS: Variant[] = ["primary", "secondary", "error"];
const SIZES: Size[] = ["normal", "small"];
const MODES: Mode[] = ["outlined", "flat"];

const AllChipsScreen: React.FC = () => {
  const { colors } = useTheme();

  const [label, setLabel] = useState("Sample chip");
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("normal");
  const [mode, setMode] = useState<Mode>("outlined");
  const [disabled, setDisabled] = useState(false);
  const [withOnPress, setWithOnPress] = useState(false);
  const [icon, setIcon] = useState<string>(""); // передаётся как prop `icon` внутрь PaperChip

  const chipProps = useMemo(
    () => ({ variant, size, mode, disabled, icon: icon || undefined, onPress:withOnPress?()=>{console.log("click")}:undefined}),
    [variant, size, mode, disabled, icon, withOnPress]
  );

  return (
    <ScrollView style={styles.container}>
      {/* Панель управления */}
      <View style={styles.inputsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Label</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            style={styles.input}
            mode="flat"
            placeholder="Chip text"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Icon (optional)</Text>
          <TextInput
            value={icon}
            onChangeText={setIcon}
            style={styles.input}
            mode="flat"
            placeholder="e.g. information, close, star"
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Variant</Text>
          <SegmentedButtons
            value={variant}
            onValueChange={(v) => setVariant(v as Variant)}
            buttons={VARIANTS.map((v) => ({ value: v, label: v }))}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Size</Text>
          <SegmentedButtons
            value={size}
            onValueChange={(s) => setSize(s as Size)}
            buttons={SIZES.map((s) => ({ value: s, label: s }))}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Mode</Text>
          <SegmentedButtons
            value={mode}
            onValueChange={(m) => setMode(m as Mode)}
            buttons={MODES.map((m) => ({ value: m, label: m }))}
          />
        </View>

        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.switchLabel}>Disabled</Text>
          <Switch value={disabled} onValueChange={setDisabled} color={colors.primary} />
        </View>

        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.switchLabel}>With on press</Text>
          <Switch value={withOnPress} onValueChange={setWithOnPress} color={colors.primary} />
        </View>

        
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Превью выбранной конфигурации */}
      <Text style={styles.sectionTitle}>Preview</Text>
      <View style={styles.preview}>
        <ChipDisplay {...chipProps}>{label}</ChipDisplay>
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Сетка всех комбинаций */}
      <Text style={styles.sectionTitle}>All combinations</Text>
      <View style={styles.grid}>
        {VARIANTS.flatMap((v) =>
          SIZES.flatMap((s) =>
            MODES.map((m) => (
              <View key={`${v}-${s}-${m}`} style={styles.card}>
                <ChipDisplay variant={v} size={s} mode={m} disabled={disabled} icon={icon || undefined}>
                  {label}
                </ChipDisplay>
                <Text style={styles.cardLabel}>{v} · {s} · {m}</Text>
              </View>
            ))
          )
        )}
      </View>
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
    alignItems: "center",
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
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-start",
    minWidth: 160,
  },
  cardLabel: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 6,
  },
});

export default AllChipsScreen;
