import Skeleton from '@components/Skeleton';
import ImageBackgroundOverlay from '@components/base/container/ImageBackgroundOverlay';
import OneScreenContainer from '@components/base/container/OneScreenContainer';
import useIsMobile from '@hooks/useIsMobile';
import isMobile from '@hooks/useIsMobile';
import { useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

  

export default function LoadingScreen() {
  const theme = useTheme()
  const {width, height} = useWindowDimensions();
  const isMobile = useIsMobile();
  const widthActual = isMobile ? width : 400
  const heightActual = isMobile ? height : 600
  const cross = isMobile ? 40 : 360

  return (
    <OneScreenContainer >
      <ImageBackgroundOverlay
        width={widthActual}
        height={heightActual}
        crossingItems={cross}      
        image={require('@assets/background_faces_with_revelcy.png')}
        backgroundColor={theme.colors.background}

      >
          <Skeleton baseColor={theme.colors.onSurfaceVariant} height={900} width={"100%"} animated={true} />
      </ImageBackgroundOverlay>
    </OneScreenContainer>
  )
}
