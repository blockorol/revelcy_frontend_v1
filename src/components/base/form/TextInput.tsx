import React from 'react';
import {
  TextInput as PaperTextInput,
  TextInputProps,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { StyleProp, TextStyle, View } from 'react-native';

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
    ...rest
  } = props;
  const {colors} = useTheme()

  return (
    <View>
      <PaperTextInput
        {...rest}
        mode={mode}
        underlineColor={underlineColor}
        theme={theme}
        error={!!errorValue}
        style={[{ backgroundColor: 'transparent' }, style]}
        right={errorValue ? <PaperTextInput.Icon icon="alert-circle" color={colors.error} /> : null}

      />
      {errorValue ? (
        <HelperText type="error" visible={true}>
          {errorValue}
        </HelperText>
      ) : null}
    </View>
  );
}
