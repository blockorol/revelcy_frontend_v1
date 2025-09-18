import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { SvgIcon } from '@components/base/SvgIcon';
import TransparentButton from '@components/login/buttons/TransparentButton';

export default function PrivyButton() {
  const theme = useTheme();

  const handlePress= () =>{}

  return (
      <TransparentButton
        onClick={handlePress}
        icon="privy"
        buttonText='Connect with with Privy'
      />
  );
}
