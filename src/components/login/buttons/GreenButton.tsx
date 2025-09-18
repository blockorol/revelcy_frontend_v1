import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { IconName, SvgIcon } from '@components/base/SvgIcon';


interface GreenButtonProps {
  buttonText: string;
  onClick: () => void;
  icon?: IconName
  disabled?:boolean
}

export default function GreenButton({buttonText, onClick, icon, disabled}:GreenButtonProps) { 
    const theme = useTheme();

    return (
      <Button
        mode="contained"
        onPress={onClick}
        disabled={disabled}
        textColor={theme.colors.onPrimary}
        labelStyle={{...theme.fonts.labelLarge}}
        style={{borderColor:theme.colors.outline, width: '100%', borderRadius: 14} }
        buttonColor={theme.colors.primary}
        icon={icon ? () => <SvgIcon name={icon} size={24} color={theme.colors.onPrimary}/> : undefined}
      >
        {buttonText}
      </Button>
  );
}
