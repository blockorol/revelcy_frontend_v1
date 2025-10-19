import React, { useState } from 'react';
import { TextInput as PaperTextInput, HelperText, useTheme, Text } from 'react-native-paper';
import { View, StyleProp, TextStyle } from 'react-native';
import { ExtendedMD3Colors } from '@theme/types';


type Props = {
  id?: string;
  label?: string;
  value: string;
  onChangeValue: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  errorValue?: string | null;
  style?: StyleProp<TextStyle>;
};

export default function TextInputMultiline({
  label,
  value,
  onChangeValue,
  placeholder,
  maxLength = 150,
  errorValue,
  style,
}: Props) {
  const {colors} = useTheme() as {colors: ExtendedMD3Colors};
  const [isFocused, setIsFocused] = useState(false);

  const [inputHeight, setInputHeight] = useState(56);

  const handleContentSizeChange = (e: any) => {
    const height = e.nativeEvent.contentSize.height;
    setInputHeight(prev => {
      return height < prev ? height : Math.max(prev, height);
    });
  };
  
  const handleChangeText = (text: string) => {
    onChangeValue(text);
    if (text.trim().length === 0) {
      setInputHeight(56);
    }
  };

  return (
    <View>
      <PaperTextInput
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        multiline
        mode="flat"
        underlineColor="transparent"
        theme={{ colors: { outline: 'transparent' } }}
        error={!!errorValue}
        onContentSizeChange={handleContentSizeChange}
        style={[
          {
            backgroundColor: 'transparent',
            textAlignVertical: 'top',
            height: Math.max(56, inputHeight), 
          },
          style
        ]}
        right={errorValue ? <PaperTextInput.Icon icon="alert-circle" color={colors.error} /> : null}
        label=" "
        placeholder=""
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
