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
  Button as ButtonPaper
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
      <Text style={styles.sectionTitle}>Base paper button:</Text>
      <View style={styles.preview}>
        <ButtonPaper disabled={buttonProps.disabled} mode={buttonProps.mode === 'tonal'?'contained-tonal': buttonProps.mode}>{label}</ButtonPaper>
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: "#555" }} />

      {/* Сетка всех комбинаций */}
{/* Комбинации: секции по Variant → строки по Size → кнопки по Modes */}
<Text style={styles.sectionTitle}>All combinations</Text>

<View style={styles.variantList}>
  {VARIANTS.map((v) => (
    <View key={v} style={styles.variantSection}>
      <Text style={styles.variantTitle}>{v.toUpperCase()}</Text>

      {SIZES.map((s) => (
        <View key={`${v}-${s}`} style={styles.sizeSection}>
          <Text style={styles.sizeTitle}>{s}</Text>

          <View style={styles.modesRow}>
            {MODES.map((m) => (
              <View key={`${v}-${s}-${m}`} style={styles.card}>
                <Text style={styles.cardLabel}>{m}</Text>
                <Button
                  variant={v}
                  size={s}
                  mode={m}
                  disabled={disabled}
                >
                  {label}
                </Button>
                <Text style={styles.cardLabel}>svgIcon</Text>   
                <Button
                  variant={v}
                  size={s}
                  mode={m}
                  disabled={disabled}
                  leftSvgIconName='plus'
                >
                  {label}
                </Button>             
                {/* <Button
                  variant={v}
                  size={s}
                  mode={m}
                  disabled={disabled}
                  leftIcon={"plus"}
                >
                  {label}
                </Button>
                <Text style={styles.cardLabel}>{m}</Text> */}

              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  ))}
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
    alignItems: 'flex-start',
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
  // card: {
  //   backgroundColor: "#444",
  //   borderRadius: 8,
  //   padding: 12,
  //   alignItems: "flex-start",
  //   minWidth: 200,
  // },
  // cardLabel: {
  //   color: "#bbb",
  //   fontSize: 12,
  //   marginTop: 6,
  // },
  variantList: {
  gap: 16,
},
variantSection: {
  backgroundColor: "#3a3a3a",
  borderRadius: 8,
  padding: 12,
  gap: 8,
},
variantTitle: {
  color: "white",
  fontSize: 18,
  fontWeight: "700",
},
sizeSection: {
  gap: 8,
},
sizeTitle: {
  color: "#ddd",
  fontSize: 14,
  marginLeft: 4,
},
modesRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12, // если gap не поддерживается — замените на паддинги у .card
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

export default AllButtonsScreen;
