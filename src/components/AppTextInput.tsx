// components/AppTextInput.tsx
import React from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export type AppTextInputProps = React.ComponentProps<typeof TextInput> & {
  withIcon?: boolean;
};

export function AppTextInput({ withIcon, ...props }: AppTextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      mode="flat"
      underlineColor="transparent"
      activeUnderlineColor={theme.colors.primary}
      style={[styles.input, props.style]}
      left={withIcon ? <TextInput.Icon icon="account" /> : undefined}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    borderRadius: 100,
    fontSize: 16,
  },
});