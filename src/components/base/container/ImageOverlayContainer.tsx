import useIsMobile from '@hooks/useIsMobile';
import React from 'react';
import {
  View,
  StyleSheet,
  ImageSourcePropType,
  useWindowDimensions,
  DimensionValue,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ImageOverlayContainerProps {
  imageWidth: DimensionValue;
  imageHeight: number;
  backgroundColor?: string;
  minImageHeight: number;
  backgroundImage: ImageSourcePropType;
  children: React.ReactNode;
}

const ImageOverlayContainer: React.FC<ImageOverlayContainerProps> = ({
  imageHeight,
  minImageHeight,
  backgroundImage,
  backgroundColor,
  children,
}) => {
  let { height: screenHeight, width } = useWindowDimensions();
  if (useIsMobile()) {
    const insets = useSafeAreaInsets();
    screenHeight = screenHeight - insets.top - insets.bottom;

  }

  return (
    <View style={[styles.wrapper, { height: screenHeight, backgroundColor }]}>
      <ImageBackground
        source={backgroundImage}
        resizeMode="stretch"
        style={{ flex: 1, width: '100%', height:'100%', justifyContent: 'flex-end', }}
      >
        
      <View
        style={{
          backgroundColor,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          marginTop: minImageHeight,
          minHeight: screenHeight-imageHeight,
        }}
      >
        <View style={{paddingTop: 40, paddingLeft:16, paddingRight:16, paddingBottom: 48}}>
          {children}
        </View>
      </View>
      </ImageBackground>

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
});

export default ImageOverlayContainer;
