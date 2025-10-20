// AllTextInputsScreen.tsx
import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput as PaperTextInput,
  SegmentedButtons,
  Switch,
  useTheme,
  Divider,
} from "react-native-paper";
import CustomTextInput from "@components/ui/TextInput";

type Mode = "flat" | "outlined";
type Kbd =
  | "default"
  | "email-address"
  | "numeric"
  | "phone-pad"
  | "number-pad"
  | "decimal-pad"
  | "url";

const MODES: Mode[] = ["flat", "outlined"];
const KBD_TYPES: Kbd[] = [
  "default",
  "email-address",
  "numeric",
  "phone-pad",
  "number-pad",
  "decimal-pad",
  "url",
];

const AllTextInputsScreen: React.FC = () => {
  const { colors } = useTheme();

  // Контролы
  const [label, setLabel] = useState("Label");
  const [placeholder, setPlaceholder] = useState("Placeholder");
  const [value, setValue] = useState("");
  const [errorValue, setErrorValue] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("flat");
  const [disabled, setDisabled] = useState(false);
  const [secure, setSecure] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [kbd, setKbd] = useState<Kbd>("default");

  const [helperErrorText, setHelperErrorText] = useState("Field is required");

  const [showRightClear, setShowRightClear] = useState(true);

  const inputProps = useMemo(
    () => ({
      label,
      placeholder,
      mode,
      errorValue,
      disabled,
      secureTextEntry: secure,
      multiline,
      keyboardType: kbd as any,
      maxLength,
      width,
    }),
    [
      label,
      placeholder,
      mode,
      errorValue,
      disabled,
      secure,
      multiline,
      kbd,
      maxLength,
      width,
    ]
  );

  return (
    <ScrollView style={styles.container}>
      {/* Панель управления */}
      <View style={styles.inputsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Label</Text>
          <PaperTextInput
            value={label}
            onChangeText={setLabel}
            style={styles.input}
            mode="flat"
            placeholder="Label"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Placeholder</Text>
          <PaperTextInput
            value={placeholder}
            onChangeText={setPlaceholder}
            style={styles.input}
            mode="flat"
            placeholder="Placeholder"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Error text</Text>
          <PaperTextInput
            value={helperErrorText}
            onChangeText={setHelperErrorText}
            style={styles.input}
            mode="flat"
            placeholder="Helper error message"
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

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Keyboard</Text>
          <SegmentedButtons
            value={kbd}
            onValueChange={(k) => setKbd(k as Kbd)}
            buttons={KBD_TYPES.map((k) => ({ value: k, label: k }))}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 30 }}>
          <View>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.switchLabel}>Disabled</Text>
              <Switch
                value={disabled}
                onValueChange={setDisabled}
                color={colors.primary}
              />
            </View>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.switchLabel}>Secure</Text>
              <Switch
                value={secure}
                onValueChange={setSecure}
                color={colors.primary}
              />
            </View>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.switchLabel}>Multiline</Text>
              <Switch
                value={multiline}
                onValueChange={setMultiline}
                color={colors.primary}
              />
            </View>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.switchLabel}>Show right clear</Text>
              <Switch
                value={showRightClear}
                onValueChange={setShowRightClear}
                color={colors.primary}
              />
            </View>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.switchLabel}>Set error</Text>
              <Switch
                value={!!errorValue}
                onValueChange={(v) => setErrorValue(v ? helperErrorText : null)}
                color={colors.error}
              />
            </View>
          </View>

          <View style={{}}>
            <Text style={styles.label}>Max length</Text>
            <PaperTextInput
              value={maxLength?.toString() ?? ""}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                setMaxLength(isNaN(n) ? undefined : n);
              }}
              style={styles.input}
              mode="flat"
              keyboardType="numeric"
              placeholder="e.g. 120"
            />
          </View>

          <View style={{}}>
            <Text style={styles.label}>Width</Text>
            <PaperTextInput
              value={width?.toString() ?? ""}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                setWidth(isNaN(n) ? undefined : n);
              }}
              style={styles.input}
              mode="flat"
              keyboardType="numeric"
              placeholder="e.g. 300"
            />
          </View>
        </View>
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Превью текущей конфигурации */}
      <Text style={styles.sectionTitle}>Preview</Text>
      <View style={styles.preview}>
        <CustomTextInput {...inputProps} style={{width:width }} value={value} onChangeText={setValue}/>
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333", padding: 16 },
  inputsContainer: { gap: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  label: { color: "white", fontSize: 14, width: 110 },
  input: { flex: 1, backgroundColor: "#555", color: "white" },
  group: { gap: 8 },
  groupTitle: { color: "white", fontSize: 14, marginBottom: 4 },
  switchLabel: { color: "white", fontSize: 14 },
  sectionTitle: { color: "white", fontSize: 16, marginBottom: 8 },
  preview: {
    backgroundColor: "gray",
    alignItems: "stretch",
    gap: 8,
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
    minWidth: 220,
    flexShrink: 1,
  },
  cardLabel: { color: "#bbb", fontSize: 12, marginBottom: 6 },
});

export default AllTextInputsScreen;
