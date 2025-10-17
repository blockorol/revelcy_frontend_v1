import React, { useState } from 'react';
import {
  TextInput as PaperTextInput,
  TextInputProps,
  HelperText,
  useTheme,
  Text,
} from 'react-native-paper';
import { StyleProp, TextStyle, View } from 'react-native';
import { ExtendedMD3Colors } from '@theme/types';

type Props = TextInputProps & {
  style?: StyleProp<TextStyle>;
  errorValue?: string | null;
};

export default function TextInput(props: Props) {
  const {
    errorValue,
    style,
    mode = 'flat',
    underlineColor = 'transparent',
    theme = { colors: { outline: 'transparent' } },
    placeholder,
    value,
    label,
    ...rest
  } = props;
  const {colors} = useTheme() as {colors: ExtendedMD3Colors}
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <PaperTextInput
        {...rest}
        value={value}
        mode={mode}
        underlineColor={underlineColor}
        theme={theme}
        error={!!errorValue}
        style={[{ backgroundColor: 'transparent' }, style]}
        right={errorValue ? <PaperTextInput.Icon icon="alert-circle" color={colors.error} /> : null}
        placeholder=""
        label=""
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {label && (
        <Text 
          variant="bodySmall" 
          style={{ 
            position: 'absolute', 
            top: -8, 
            left: 8, 
            color: colors.onSurfaceVariant,
            backgroundColor: colors.surfaceContainerLowest,
            paddingHorizontal: 4,
            pointerEvents: 'none'
          }}
        >
          {label}
        </Text>
      )}
      {placeholder && !value && !isFocused && (
        <Text 
          variant="bodyMedium" 
          style={{ 
            position: 'absolute', 
            top: 16, 
            left: 12, 
            color: colors.onSurfaceVariant,
            pointerEvents: 'none'
          }}
        >
          {placeholder}
        </Text>
      )}
      {errorValue ? (
        <HelperText type="error" visible={true}>
          {errorValue}
        </HelperText>
      ) : null}
    </View>
  );
}
