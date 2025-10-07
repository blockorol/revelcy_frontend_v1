import { Button } from '@components/ui/Button';
import { Share } from "react-native";

type Props = React.ComponentProps<typeof Button> & {
  shareMessage: string;
}
export function ShareTextButton({ shareMessage, children, ...rest}: Props) {
  const onShare = async () => {
    await Share.share({ message: shareMessage });
  };

  return (
    <Button
      leftSvgIconName='tg-logo'
      onPress={onShare}
      {...rest}
    >{children}</Button>
  );
}
