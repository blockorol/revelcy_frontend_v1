// NotificationPlaygroundScreen.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, useTheme, Switch, HelperText, Divider } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useNotification } from "@providers/NotificationContext";

type NoticeType = "info" | "success" | "warning" | "error";
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export default function NotificationPlaygroundScreen() {
  const theme = useTheme();
  const notify = useNotification();

  // Controls
  const [message, setMessage] = useState("Some error!");
  const [message2, setMessage2] = useState("Suggestion!");
  const [type, setType] = useState<NoticeType>("info");
  const [duration, setDuration] = useState(3000); // ms
  const [hasAction, setHasAction] = useState(false);
  const [actionLabel, setActionLabel] = useState("Undo");
  const actionCounterRef = useRef(0);
  const [actionClicks, setActionClicks] = useState(0);

  const [burstCount, setBurstCount] = useState(5);
  const [longMessage, setLongMessage] = useState(false);

  const previewMsg = useMemo(() => {
    if (!longMessage) return message;
    return (
      message +
      " — Long text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae felis sit amet mauris."
    );
  }, [message, longMessage]);

  const callNotification = () => {
    const options = {
      suggest: message2,
      type,
      duration,
      action: (hasAction && actionLabel
        ? {
            label:actionLabel,
            onAction: () => {
              actionCounterRef.current += 1;
              setActionClicks(actionCounterRef.current);
            },
          }
        : undefined),
    } as Parameters<typeof notify.show>[1];

    notify.show(previewMsg, options);
  };

  const callPreset = (t: NoticeType) => {
    notify[t](`${t.toUpperCase()}: sample message`, {
      duration,
      suggest:"second line",
      ...(hasAction && actionLabel ? { actionLabel, onAction: () => {
        actionCounterRef.current += 1;
        setActionClicks(actionCounterRef.current);
      }} : {}),
    });
  };

  const callBurst = async () => {
    notify.show(`Queued #1`, {type});
    await sleep(1000)
    for (let i = 2; i <= Math.max(1, Math.round(burstCount)); i++) {
      notify.show(`Queued #${i}`, {type});
    }
  };

  return (
    <ScrollView style={{ padding: 16, backgroundColor: "grey"}}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🧪 Notification Playground</Text>

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Preview tip */}
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Как пользоваться
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Настрой параметры справа и нажми <Text style={{ fontWeight: "bold" }}>«Вызвать»</Text>.
            Снизу-слева (на Web) появится Snackbar. На мобильных — снизу по центру. Сообщения ставятся в очередь.
          </Text>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Быстрые типы</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <Button mode="contained" onPress={() => callPreset("info")}>Info</Button>
            <Button mode="contained" onPress={() => callPreset("success")}>Success</Button>
            <Button mode="outlined" onPress={() => callPreset("warning")}>Warning</Button>
            <Button mode="outlined" onPress={() => callPreset("error")}>Error</Button>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Стресс-тест очереди</Text>
          <View style={{ marginTop: 8 }}>
            <Text>Сколько сообщений: {burstCount}</Text>
            <Slider
              value={burstCount}
              minimumValue={1}
              maximumValue={20}
              step={1}
              onValueChange={setBurstCount as (v: number) => void}
            />
            <Button onPress={callBurst}>Поставить в очередь</Button>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleSmall">Статистика действия</Text>
          <Text>Нажатий по action-кнопке: {actionClicks}</Text>
          <Button onPress={() => { actionCounterRef.current = 0; setActionClicks(0); }}>
            Сбросить счётчик
          </Button>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Message */}
          <Text style={styles.groupTitle}>Сообщение</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Текст уведомления"
            autoCapitalize="none"
            mode="outlined"
          />
          <View style={styles.rowBetween}>
            <Text>Длинное сообщение</Text>
            <Switch value={longMessage} onValueChange={setLongMessage} />
          </View>
          
          {/* Message */}
          <Text style={styles.groupTitle}>Сообщение 2</Text>
          <TextInput
            value={message2}
            onChangeText={setMessage2}
            placeholder="Текст уведомления"
            autoCapitalize="none"
            mode="outlined"
          />

          {/* Type */}
          <Text style={styles.groupTitle}>Тип</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Button mode={type === "info" ? "contained" : "outlined"} onPress={() => setType("info")}>
              info
            </Button>
            <Button mode={type === "success" ? "contained" : "outlined"} onPress={() => setType("success")}>
              success
            </Button>
            <Button mode={type === "warning" ? "contained" : "outlined"} onPress={() => setType("warning")}>
              warning
            </Button>
            <Button mode={type === "error" ? "contained" : "outlined"} onPress={() => setType("error")}>
              error
            </Button>
          </View>

          {/* Duration */}
          <Text style={styles.groupTitle}>Длительность (мс)</Text>
          <Text style={styles.label}>{duration}</Text>
          <Slider
            value={duration}
            minimumValue={1000}
            maximumValue={10000}
            step={250}
            onValueChange={setDuration as (v: number) => void}
          />
          <HelperText type="info" visible>
            Поставь ~Infinity: просто установи очень большое число, например 60_000 (1 мин).
          </HelperText>

          {/* Action */}
          <Text style={styles.groupTitle}>Кнопка действия</Text>
          <View style={styles.rowBetween}>
            <Text>Добавить action</Text>
            <Switch value={hasAction} onValueChange={setHasAction} />
          </View>
          {hasAction && (
            <>
              <Text style={styles.label}>Подпись кнопки</Text>
              <TextInput value={actionLabel} onChangeText={setActionLabel} autoCapitalize="none" mode="outlined" />
              <HelperText type="info" visible>
                Обработчик увеличивает счётчик «Нажатий по action-кнопке».
              </HelperText>
            </>
          )}

          {/* Trigger */}
          <Divider style={{ marginVertical: 16 }} />
          <Button mode="contained" onPress={callNotification}>
            Вызвать уведомление
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  controls: {
    width: 360,
    marginLeft: 16,
    paddingBottom: 100,
  },
  groupTitle: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#666",
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
  rowBetween: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
