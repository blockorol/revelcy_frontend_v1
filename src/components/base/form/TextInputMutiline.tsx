import React, { useState } from 'react';
import { TextInput as PaperTextInput, HelperText, useTheme, Text } from 'react-native-paper';
import { View, StyleProp, TextStyle } from 'react-native';
import { AppTheme } from '@theme/types';


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
  const {colors, fonts} = useTheme() as AppTheme;
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [inputHeight, setInputHeight] = useState(56);

  const textColor = errorValue
    ? colors.error
    : isFocused
    ? colors.primary
    : isHovered
    ? colors.onSurface
    : colors.onSurfaceVariant;

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
          fonts.bodyLarge,
          {
            backgroundColor: 'transparent',
            textAlignVertical: 'top',
            height: Math.max(56, inputHeight), 
          },
          style
        ]}
        contentStyle={[
          fonts.bodyLarge,
          {
            paddingTop: 16,
            paddingBottom: 0,
            paddingLeft: 8,
            paddingRight: 12,
          }
        ]}
        placeholderTextColor={colors.onSurfaceVariant}
        placeholder={placeholder}
        right={errorValue ? <PaperTextInput.Icon icon="alert-circle" color={colors.error} /> : null}
        label={undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      />
      {label && (
        <Text 
          variant="bodySmall" 
          style={{ 
            position: 'absolute', 
            top: -8, 
            left: 4, 
            color: textColor,
            backgroundColor: colors.surfaceContainerLowest,
            paddingHorizontal: 4,
            pointerEvents: 'none'
          }}
        >
          {label}
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
