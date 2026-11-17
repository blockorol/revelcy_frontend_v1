import { SvgIcon } from '@components/base/SvgIcon';
import React from 'react';
import {
  View,
  ImageSourcePropType,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

export interface Paddings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
interface Props {
  image: ImageSourcePropType;
  width: number;
  height: number;
  crossingItems: number;
  backgroundColor: string;
  children: React.ReactNode;
  paddings?: Paddings;
}

const ImageBackgroundOverlay: React.FC<Props> = ({
  image,
  width,
  height,
  crossingItems,
  backgroundColor,
  children,
  paddings
}) => {
  const {colors} = useTheme()
  if (paddings === undefined) {
    paddings = {
      top: 40,
      left:16,
      right:16,
      bottom: 48,
    }
  }
  const heightBottomSection = height-width+crossingItems
  const visibleHeight = width - crossingItems;

  return (
    <View style={{ width, height, backgroundColor }}>
      <ImageBackground
        source={image}
        resizeMode="stretch"
        style={{ width, height:width }}
      >
        {getData(visibleHeight, colors)}
      </ImageBackground>

      <View style={{marginTop: -crossingItems, backgroundColor, borderRadius: 14}}>
        <View style={{ height: heightBottomSection, justifyContent:"flex-end", 
          paddingTop: paddings.top,
          paddingBottom: paddings.bottom,
          paddingRight: paddings.right,
          paddingLeft: paddings.left,
          }}>
          {children}
        </View>
      </View>
    </View>
  );
};

function getData(visibleHeight: number, colors:MD3Colors) {
  if (visibleHeight>56) {
    return <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: visibleHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SvgIcon name='revelcy-logo' color={colors.onPrimary} style={{borderRadius: 16, paddingTop:8, paddingBottom:8, height:40, width: 190, backgroundColor:colors.primary}}/>
        </View>
  }
  return <View></View>
}


export default ImageBackgroundOverlay;
