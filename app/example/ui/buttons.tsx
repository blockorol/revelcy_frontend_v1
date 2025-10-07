// AllButtonsScreen.tsx
import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  SegmentedButtons,
  Switch,
  useTheme,
  Divider,
  Icon,
} from "react-native-paper";
import { Button } from "@components/ui/Button";
import { IconName, icons } from "@components/base/SvgIcon";

type Variant = "primary" | "secondary" | "error";
type Size = "normal" | "small";
type Mode = "contained" | "outlined" | "text" | "elevated" | "tonal";

const VARIANTS: Variant[] = ["primary", "secondary", "error"];
const SIZES: Size[] = ["normal", "small"];
const MODES: Mode[] = ["contained", "outlined", "text", "elevated", "tonal"];

const AllButtonsScreen: React.FC = () => {
  const { colors } = useTheme();

  const [label, setLabel] = useState("Label");
  const [icon, setIcon] = useState<string>("");
  
  const [iconSvgRaw, setIconSvgRaw] = useState<string>("");
  const [leftSvgIconName, setIconSvg] = useState<IconName|undefined>(undefined);
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("normal");
  const [mode, setMode] = useState<Mode>("contained");
  const [disabled, setDisabled] = useState(false);

  const leftIcon =
    icon.trim().length > 0
      ? (color: string, sizeNum: number) => (
          <Icon source={icon as any} color={color} size={sizeNum} />
        )
      : undefined;


  const buttonProps = useMemo(
    () => ({ variant, size, mode, disabled, leftIcon, leftSvgIconName}),
    [variant, size, mode, disabled, leftIcon, leftSvgIconName]
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
            placeholder="Button text"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Icon (optional)</Text>
          <TextInput
            value={icon}
            onChangeText={setIcon}
            style={styles.input}
            mode="flat"
            placeholder='e.g. "plus", "pencil", "cog"'
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IconSvg (optional)</Text>
          <TextInput
            value={iconSvgRaw}
            onChangeText={(t) => {
                setIconSvgRaw(t)
                if (t in icons) {
                    setIconSvg(t as IconName)
                }
            }}
            style={styles.input}
            mode="flat"
            placeholder='e.g. "plus", "pencil", "cog"'
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
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Превью выбранной конфигурации */}
      <Text style={styles.sectionTitle}>Preview</Text>
      <View style={styles.preview}>
        <Button {...buttonProps}>{label}</Button>
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Сетка всех комбинаций */}
      <Text style={styles.sectionTitle}>All combinations</Text>
      <View style={styles.grid}>
        {VARIANTS.flatMap((v) =>
          SIZES.flatMap((s) =>
            MODES.map((m) => (
              <View key={`${v}-${s}-${m}`} style={styles.card}>
                <Button
                  variant={v}
                  size={s}
                  mode={m}
                  disabled={disabled}
                  leftIcon={leftIcon}
                  leftSvgIconName={leftSvgIconName}
                >
                  {label}
                </Button>
                <Text style={styles.cardLabel}>
                  {v} · {s} · {m}
                </Text>
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
    minWidth: 200,
  },
  cardLabel: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 6,
  },
});

export default AllButtonsScreen;
