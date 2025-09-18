
import * as React from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Portal, Modal, Surface, Text, Button, useTheme } from 'react-native-paper';

/**
 * TimePickerMD3
 *
 * Colors (MD3):
 *  Active field: border + caret = primary; background = onPrimary; text = onSurface
 *  Inactive field: text = onSurface; background = surfaceContainerHighest; no border
 *  Buttons:
 *    - Save: contained (bg = primary, text = onPrimary)
 *    - Cancel: outlined (text = onSurface; bg = transparent; border = outline)
 *  Container: bg = surfaceContainerLow; text (header) = onSurfaceVariant
 *  Colon between fields: color = onSurface
 */

export type TimeValue = { hour: number; minute: number };

export type TimePickerMD3Props = {
  visible: boolean;
  value?: Date; // default now rounded to minute
  onDismiss?: () => void;
  onConfirm?: (time: TimeValue) => void;
  label?: string; // e.g., "Enter time"
  // 24h only for simplicity; add am/pm if needed later
};

export default function TimePickerMD3({
  visible,
  value,
  onDismiss,
  onConfirm,
  label = 'Enter time',
}: TimePickerMD3Props) {
  const theme = useTheme();
  // MD3 tokens
  const C = {
    primary: (theme.colors as any).primary,
    onPrimary: (theme.colors as any).onPrimary,
    onSurface: (theme.colors as any).onSurface,
    onSurfaceVariant: (theme.colors as any).onSurfaceVariant,
    surfaceContainerLow: (theme.colors as any).surfaceContainerLow ?? theme.colors.surface,
    surfaceContainerHighest: (theme.colors as any).surfaceContainerHighest ?? theme.colors.surface,
    outline: (theme.colors as any).outline ?? (theme as any).colors.outline,
  };

  const now = React.useMemo(() => new Date(), [visible]);
  const initial: TimeValue = React.useMemo(
    () => ({
      hour: clamp(value?.getHours() ?? now.getHours(), 0, 23),
      minute: clamp(value?.getMinutes() ?? Math.round(now.getMinutes()), 0, 59),
    }),
    [value, now]
  );

  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [active, setActive] = React.useState<'hour' | 'minute'>('hour');

  React.useEffect(() => {
    if (!visible) return;
    setHour(initial.hour);
    setMinute(initial.minute);
  }, [visible]);

  const onSave = () => onConfirm?.({ hour, minute });

  return (
    <Portal >
      <Modal style={{alignItems: 'center', justifyContent: 'center',}} visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer]}>        
        <Surface style={[styles.surface, { backgroundColor: C.surfaceContainerLow }]}>          
          <Text style={[styles.title, { color: C.onSurfaceVariant }]}>{label}</Text>

          <View style={styles.inputsRow}>
            <TimeField
              ariaLabel="Hour"
              value={hour}
              onChange={(n) => setHour(clamp(n, 0, 23))}
              active={active === 'hour'}
              onFocus={() => setActive('hour')}
              colors={C}
            />

            <Text style={[styles.colon, { color: C.onSurface }]}>:</Text>

            <TimeField
              ariaLabel="Minute"
              value={minute}
              onChange={(n) => setMinute(clamp(n, 0, 59))}
              active={active === 'minute'}
              onFocus={() => setActive('minute')}
              colors={C}
            />
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.cancelBtn, { borderColor: C.outline, backgroundColor: 'transparent' }]}
              textColor={C.onSurface}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={onSave}
              style={styles.saveBtn}
              buttonColor={C.primary}
              textColor={C.onPrimary}
            >
              Save
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

function TimeField({
  ariaLabel,
  value,
  onChange,
  active,
  onFocus,
  colors,
}: {
  ariaLabel: string;
  value: number;
  onChange: (n: number) => void;
  active: boolean;
  onFocus: () => void;
  colors: any;
}) {
  const ref = React.useRef<RNTextInput>(null);
  React.useEffect(() => {
    if (active) ref.current?.focus();
  }, [active]);

  const bg = active ? colors.onPrimary : colors.surfaceContainerHighest;
  const borderWidth = active ? 2 : 0;

  return (
    <View
      style={{
        gap: 7,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',

      }}
    >
        <View
        style={[
            styles.fieldContainer,
            { backgroundColor: bg, borderColor: colors.primary, borderWidth },
        ]}
        >
        <RNTextInput
            ref={ref}
            accessibilityLabel={ariaLabel}
            value={pad2(value)}
            onChangeText={(t) => onChange(parseNumeric(t))}
            keyboardType="number-pad"
            maxLength={3}
            onFocus={onFocus}
            style={[styles.input, { color: colors.onSurface, caretColor: colors.primary}]}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            underlineColorAndroid="transparent"

        />
        </View>
        <Text variant='bodySmall'>{ariaLabel}</Text>
    </View>
  );
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function parseNumeric(t: string) {
  const only = t.replace(/[^0-9]/g, '').slice(0, 3);
  return Number(only || '0');
}

function clamp(n: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, n));
}

const styles = StyleSheet.create({
  modalContainer: { 
    maxHeight: 300, 
    maxWidth: 400,
    padding: 24 
},
  surface: {
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  fieldContainer: {
    width: 96,
    height: 72,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
    width: 96,
    height: 72,
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
  } as any,
  colon: {
    fontSize: 64,
    fontWeight: '700',
    marginHorizontal: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    marginLeft: 12,
  },
});
