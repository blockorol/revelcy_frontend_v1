import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Button } from '@components/ui/Button'
import { useLoginModal } from '@providers/LoginModalContext';


export default function LoginButton({style}:{
  style?: ViewStyle}) {
  const {colors} = useTheme();
  const { openLogin } = useLoginModal();

  return (
    <View style={[style]}>
      <Button size='small' mode='outlined' variant='primary' textColor={colors.onSurface} onPress={() => openLogin()}>
        Log in
      </Button>
    </View>
  );
}
