import * as React from 'react';
import {
  SegmentedButtons as PaperSegmentedButtons,
  useTheme,
  type SegmentedButtonsProps,
} from 'react-native-paper';
import type { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';
import { makeTransparent } from '@utils/colors';
import { AppTheme } from '@theme/types';

/**
 * RevelcySegmentedButtons — content-width версия
 * Не растягивается на всю ширину контейнера: ширина = контент + горизонтальные паддинги.
 * Фиксируем высоту 30, радиус 8, бордер 1px outlineVariant.
 * Цвета для активного состояния — прямо в объекте кнопки (selectedBackgroundColor / selectedTextColor).
 */

// Базовые собственные пропсы
type OwnProps = {
  baseBackgroundColor?: string;
  baseTextColor?: string;
  height?: number;
};

// База RNP без value/multiSelect
type BaseRNPProps = Omit<ComponentProps<typeof PaperSegmentedButtons>, 'value' | 'multiSelect'>;

export type RevelcySegmentedButtonsSingleProps = BaseRNPProps & OwnProps & {
  value: string;
  multiSelect?: false | undefined;
};
export type RevelcySegmentedButtonsMultiProps = BaseRNPProps & OwnProps & {
  value: string[];
  multiSelect: true;
};
export type RevelcySegmentedButtonsProps =
  | RevelcySegmentedButtonsSingleProps
  | RevelcySegmentedButtonsMultiProps;

export default function RevelcySegmentedButtons(props: RevelcySegmentedButtonsProps) {
  const {
    value,
    buttons,
    style,
    baseBackgroundColor,
    baseTextColor,
    height = 30,
    ...rest
  } = props ;

  const theme = useTheme() as AppTheme;
  theme.roundness=2

  const mappedButtons: SegmentedButtonsProps['buttons'] = buttons.map((btn) => {
    if (!btn.checkedColor) {
        btn.checkedColor = theme.colors.primary
    }
    const isSelected = value && (!Array.isArray(value) ? value === btn.value : value.includes(btn.value));

    const bg = isSelected ? (makeTransparent(btn.checkedColor, 0.85)) : (baseBackgroundColor??'transparent');
    const textColor = isSelected ? (btn.checkedColor) : (baseTextColor??theme.colors.onSurfaceVariant);

    const segmentStyle: ViewStyle = {
      height,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
      backgroundColor: bg,
    };

    return {
      ...btn,
      uncheckedColor: 'transparent',
      style: [ segmentStyle],
      labelStyle: [theme.fontsProminent.labelMedium, {color:textColor, paddingBottom: 5}],
      showSelectedCheck: false,
    };
  });

  const containerStyle: ViewStyle = {
    borderRadius: 8,
    height,
    overflow: 'hidden',
    backgroundColor: baseBackgroundColor,
    alignSelf: 'flex-start',
    alignContent: 'center',
    width: 'auto',
  };

  return (
    <PaperSegmentedButtons
      density="medium"
      value={value}
      buttons={mappedButtons}
      style={[containerStyle, style]}
      theme={theme}
      {...(rest as any)}
    />
  );
}
