import { Button } from '@components/ui/Button';
import useIsMobile from '@hooks/useIsMobile';
import { useNotification } from '@providers/NotificationContext';
import { tryCopy } from '@utils/actions';
import { Share } from "react-native";

type Props = React.ComponentProps<typeof Button> & {
  shareMessage: string;
}
export function ShareTextButton({ shareMessage, children, ...rest}: Props) {
  const notify = useNotification();
  const isMobile = useIsMobile();
  
  const onShare = async () => {
    await tryCopy(shareMessage);
    if (!isMobile) {
      notify.info("Share text copied to clipboard");
      return;
    }
    await Share.share({ message: shareMessage });
  };

  return (
    <Button
      leftSvgIconName='send'
      onPress={onShare}
      {...rest}
    >{children}</Button>
  );
}
