import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import RevelcySegmentedButtons from '@components/ui/SegmentedButton';
import { Button } from '@components/ui/Button';

/**
 * Демо‑страница для RevelcySegmentedButtons с тремя наборами стилей:
 * 1) Синий — secondary / onSecondary
 * 2) Зелёный — primary / onPrimary
 * 3) Серый — surfaceContainer / onSurface
 */


export default function AllSegmentedButtonsScreen() {
  const theme = useTheme();

  // Фолбэки для surfaceContainer на случае старого типового набора цветов
  const surfaceContainer =
    (theme.colors as any).surfaceContainer ??
    (theme.colors as any).surfaceVariant ??
    '#3A3A3A';

  const [value, setValue] = useState('secondary');

  const buttons = [{
            value: "secondary",
            label: "secondary",
            checkedColor: theme.colors.secondary,
            uncheckedColor: theme.colors.onSurfaceVariant
          }, {
            value: "primary",
            label: "primary",
            checkedColor: theme.colors.primary,
            uncheckedColor: theme.colors.onSurfaceVariant
          },
          {
            value: "my",
            label: 'My Tokens',
            checkedColor: theme.colors.onSurface,
            uncheckedColor: theme.colors.onSurfaceVariant
          }]


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
      <Text style={styles.header}>Segmented Buttons — брендовые палитры</Text>

      <View style={styles.rowBlock}>
        <RevelcySegmentedButtons
          value={value}
          onValueChange={setValue}
          buttons={buttons}
          baseBackgroundColor="transparent"
          baseTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      <Divider style={{ marginVertical: 16, backgroundColor: '#555' }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '700',
  },
  rowBlock: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  note: {
    color: '#BBB',
    fontSize: 12,
    lineHeight: 18,
  },
});
