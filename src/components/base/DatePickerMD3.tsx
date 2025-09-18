import React, { useState } from "react";
import { View } from "react-native";
import { Portal, Modal, Surface, Text, Button, useTheme } from "react-native-paper";
import { Calendar } from "react-native-paper-dates";

type Props = {
  visible: boolean;
  date?: Date | null;
  onDismiss: () => void;
  onConfirm: (d: Date) => void;
  label?: string;
};

export function DatePickerMD3FromCalendar({
  visible,
  date,
  onDismiss,
  onConfirm,
  label = "Select date",
}: Props) {
  const { colors } = useTheme() as any;
  const C = {
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    surfaceContainerLow: colors.surfaceContainerLow ?? colors.surface,
    outline: colors.outline,
  };

  const [selected, setSelected] = useState<Date | undefined>(date ?? new Date());

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Surface
          style={{
            width: 340,
            borderRadius: 20,
            padding: 16,
            backgroundColor: C.surfaceContainerLow,
          }}
        >
          {/* Заголовок */}
          <Text style={{ color: C.onSurfaceVariant, marginBottom: 8 }}>{label}</Text>


          {/* Календарь из либы */}
          <Calendar
            mode="single"
            date={selected}
            onChange={({ date }) => setSelected(date ?? undefined)}
            locale="en"
            startWeekOnMonday={false}
          />

          {/* Кнопки снизу */}
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={{ flex: 1, marginRight: 8, borderRadius: 999 }}
              textColor={C.onSurface}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => selected && onConfirm(selected)}
              style={{ flex: 1, marginLeft: 8, borderRadius: 999 }}
              buttonColor={C.primary}
              textColor={C.onPrimary}
              disabled={!selected}
            >
              Next
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}
