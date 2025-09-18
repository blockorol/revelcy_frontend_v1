import Skeleton from '@components/Skeleton';
import ImageBackgroundOverlay from '@components/base/container/ImageBackgroundOverlay';
// import ImageOverlayContainer from '@components/base/container/ImageOverlayContainer';

import OneScreenContainer from '@components/base/container/OneScreenContainer';
import useIsMobile from '@hooks/useIsMobile';
import { useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';

  

export default function LoadingScreen() {
  const theme = useTheme()
  
  const {width, height} = useWindowDimensions();
  const isMobile = useIsMobile();
  const widthActual = isMobile ? width : 400
  const heightActual = isMobile ? height : 600
  const cross = isMobile ? 40 : 360
  return (
    <View style={{    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // Очень высокий приоритет
    elevation: 10, // для Android (если нужно)
    backgroundColor: 'rgba(0,0,0,0.5)', // пример
}}>
    <OneScreenContainer>
      <ImageBackgroundOverlay
        image={require('@assets/background_faces_with_revelcy.png')}
        backgroundColor={theme.colors.background}
        width={widthActual}
        height={heightActual}
        crossingItems={cross}
      >
          <Skeleton baseColor={theme.colors.surfaceVariant} height={200} width={"100%"} animated={true} />
      </ImageBackgroundOverlay>
    </OneScreenContainer>
    </View>
  )

  // return (
  //   <OneScreenContainer width = {width}>
  //     <ImageOverlayContainer
      
  //     imageHeight={400}
  //     imageWidth={"100%"}
  //       minImageHeight={60}
  //       backgroundImage={require('@assets/background_faces_with_revelcy.png')}
  //       backgroundColor={theme.colors.background}
  //     >
  //         <Skeleton baseColor={theme.colors.surfaceVariant} height={200} width={"100%"} animated={true} />
  //     </ImageOverlayContainer>
  //   </OneScreenContainer>
  // )
}
