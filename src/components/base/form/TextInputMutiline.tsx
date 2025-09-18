import React, { useState } from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { View } from 'react-native';

type Props = {
  id?: string;
  label?: string;
  value: string;
  onChangeValue: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export default function TextInputMultiline({
  label,
  value,
  onChangeValue,
  placeholder,
  maxLength = 150,
}: Props) {
  const [inputHeight, setInputHeight] = useState(56);

  const handleContentSizeChange = (e: any) => {
    const height = e.nativeEvent.contentSize.height;
    setInputHeight(prev => {
      return height < prev ? height : Math.max(prev, height);
    });
  };

  const handleChangeText = (text: string) => {
    onChangeValue(text);

    // если поле полностью очищено — сбрасываем высоту
    if (text.trim().length === 0) {
      setInputHeight(56);
    }
  };

  return (
    <View>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        multiline
        placeholder={placeholder}
        mode="flat"
        underlineColor="transparent"
        theme={{ colors: { outline: 'transparent' } }}
        onContentSizeChange={handleContentSizeChange}
        style={{
          backgroundColor: 'transparent',
          textAlignVertical: 'top',
          height: Math.max(56, inputHeight),
        }}
      />
    </View>
  );
}
