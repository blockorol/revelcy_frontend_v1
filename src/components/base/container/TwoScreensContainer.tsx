import React from 'react';
import { ScrollView, View } from 'react-native';
import { useIsMobileForTwoScreenWithDemention } from '@hooks/useIsMobile';
import { useContentArea } from '@hooks/useContentArea';

interface TwoScreenContainerProps {
  left: React.ReactNode;
  right: React.ReactNode;
  backgroundColor?: string;
}

const TwoScreenContainer: React.FC<TwoScreenContainerProps> = ({
  left,
  right,
  backgroundColor,
}) => {
  const { contentHeight } = useContentArea();

  const dem = useIsMobileForTwoScreenWithDemention()
  if (dem.isMobile) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 0,
          width: '100%',
          alignItems: 'center',
          backgroundColor
        }}
      >
        <View style={{ maxWidth:dem.maxWidth, width: '100%', paddingTop: 0}}>{left}</View>
        <View style={{ maxWidth:dem.maxWidth, width: '100%', paddingTop: 16}}>{right}</View>
      </ScrollView>
    );
  };
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{height:contentHeight-24}}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor,
        paddingHorizontal: 16,
        paddingTop: 12, paddingBottom: 12,
        width: '100%',
        alignSelf: 'center',
        gap: 24,
      }}
    >
      <View style={{ width: dem.left.width, flexShrink: 0 }}>
          {left}
      </View>
      <View
        style={{
          flexGrow: 1,
          minWidth: 400,
          maxWidth: 800,
        }}
      >
          {right}
      </View>
  </View>
    </ScrollView>
  );

}

export default TwoScreenContainer;
