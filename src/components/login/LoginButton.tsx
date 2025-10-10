import React, { useState } from 'react';
import { View, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Button } from '@components/ui/Button'
import LoginFlow from './LoginFlow';
import OneScreenContainer from '@components/base/container/OneScreenContainer';

export default function LoginButton() {
  const {colors} = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button mode='outlined' variant='primary' textColor={colors.onSurface} onPress={() => setVisible(true)}>
        Login
      </Button>
      <LoginModal visible={visible} setVisible={setVisible}/>
    </View>
  );
}

export function LoginModal({visible, setVisible}: {
  visible:boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
} ) {
  const theme = useTheme()
  return (
      <Modal visible={visible} animationType="none" transparent>
        <OneScreenContainer backgroundColor= {theme.colors.shadow }>
          <LoginFlow onCloseButton={() => {
            setVisible(false)}
           } />
        </OneScreenContainer>
      </Modal>

  )
}
