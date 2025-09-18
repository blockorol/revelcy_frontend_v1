import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { IconName, SvgIcon } from '@components/base/SvgIcon';

interface TransparentButtonProps {
  buttonText: string;
  onClick: () => void;
  icon?: IconName
}



export default function TransparentButton({buttonText, onClick, icon}:TransparentButtonProps) {
  const theme = useTheme();

  return (
      <Button
        mode="outlined"
        onPress={onClick}
        labelStyle={{...theme.fonts.labelLarge}}
        style={{width: '100%', borderColor: theme.colors.outline, borderRadius: 14}}
        textColor={theme.colors.onSurface}
        icon={icon?() => <SvgIcon name={icon} size={24} color={theme.colors.onSurface} />:undefined}
      >
        {buttonText}
      </Button>
  );
}
