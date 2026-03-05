import React, { useState } from "react";
import {
  TextInput as PaperTextInput,
  TextInputProps,
  HelperText,
  useTheme,
} from "react-native-paper";
import { Text } from "@components/ui/Text";
import { StyleProp, TextStyle, View } from "react-native";
import { AppTheme } from "@theme/types";
import { SvgIcon } from "@components/base/SvgIcon";

type Props = Omit<TextInputProps, 'label'> & {
  alwaysLabelOnTop?: boolean;
  style?: StyleProp<TextStyle>;
  disableRemoveBtn?: boolean;
  overrideRemoveBtn?: ()=>void;
  errorValue?: string | null;
  backgroundColor?: string
  label?: string;
  rightAffixText?: string;
};

export default function TextInput(props: Props) {
  const {
    alwaysLabelOnTop,
    disableRemoveBtn,
    overrideRemoveBtn,
    errorValue,
    error,
    style,
    mode = "flat",
    underlineColor = "transparent",
    backgroundColor,
    theme,
    value,
    label,
    rightAffixText, 
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    placeholder,
    multiline, // just to skip the field
    ...rest
  } = props;
  const { colors, fonts } = useTheme() as AppTheme;
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textColor = errorValue
    ? colors.error
    : isFocused
    ? colors.primary
    : isHovered
    ? colors.onSurface
    : colors.onSurfaceVariant;

  // backgroundColor 'transparent' breaks cursor
  const fixColor = (color?: string) =>{
    return  color && color !=='transparent' ? color : colors.surfaceContainerLowest
  }
  const fixedBackGroundColor = fixColor(backgroundColor)

  
  const showLabelOnTop = !!alwaysLabelOnTop || isFocused || !!value
  const showLabelOnPlaceholder = !showLabelOnTop;


  return (
    <View style={{backgroundColor:fixedBackGroundColor, width:'100%'}}>
      { !!label &&  (showLabelOnTop?
        <View style={{ backgroundColor: 'transparent' }}>
          <Text
            variant="bodySmall"
            style={{
              pointerEvents: 'none',
              color: textColor,
              paddingLeft: 8,
              paddingTop: 0
            }}
          >
            {label}
          </Text>
        </View>
      :
        <View style={{ backgroundColor: 'transparent'}}>
          <Text
            variant="bodySmall"
            style={{ pointerEvents: 'none', paddingTop: 0}}
          >
            {" "}
          </Text>
        </View>
      )}
      
      <PaperTextInput
        {...rest}
        value={value}
        mode={mode}
        underlineColor={underlineColor}
        theme={theme}
        error={!!errorValue || !!error}
        style={[
          fonts.bodyLarge,
          { 
          height: 40, 
          paddingVertical: 0, 
          backgroundColor: fixedBackGroundColor 
        },
          style,
        ]}
        contentStyle={[
          fonts.bodyLarge,
          {
            backgroundColor: fixedBackGroundColor,
            height: 40,
            paddingLeft: 8,
            paddingVertical: 0,
            justifyContent: "center",
          },
        ]}
        placeholderTextColor={
          showLabelOnPlaceholder ? 
            !!errorValue ? colors.error:
            rest.disabled ? colors.onSurfaceDisabled :
            colors.onSurface  
          : undefined}
        placeholder={showLabelOnPlaceholder? label: placeholder}
        right={
        errorValue
          ? <PaperTextInput.Icon icon="alert-circle" color={colors.error} />
          : rightAffixText
            ? <PaperTextInput.Affix text={rightAffixText} />
            : !disableRemoveBtn
              ? (
                <PaperTextInput.Icon
                  icon={(_iconProps) => (
                    <SvgIcon name="x-circle-outlined" color={colors.onSurface} size={24} />
                  )}
                  color={colors.onSurface}
                  onPress={() => {
                    if (overrideRemoveBtn) return overrideRemoveBtn();
                    rest.onChangeText?.("");
                  }}
                />
              )
              : undefined
      }
        label={ undefined }
        onPointerEnter={(e) => {
          setIsHovered(true);
          onPointerEnter && onPointerEnter(e);
        }}
        onPointerLeave={(e) => {
          setIsHovered(false);
          onPointerLeave && onPointerLeave(e);
        }}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus && onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur && onBlur(e);
        }}
        
      />
      <View style={{ backgroundColor: 'transparent' }}>
        <HelperText
          type="error"
          style={[
            fonts.bodySmall,
            {paddingTop: !!errorValue?4:0, paddingBottom: 0, paddingLeft: 8,},
          ]}
          visible={!!errorValue}
        >{errorValue}
        </HelperText>
      </View>
    </View>
  );
}
