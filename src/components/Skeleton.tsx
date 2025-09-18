import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  ViewStyle,
  LayoutChangeEvent,
  DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  baseColor?: string;
  shimmerColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  baseColor = '#e0e0e0',
  shimmerColor = 'rgba(255,255,255,0.4)',
  animated = true,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const layoutWidth = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startShimmer = () => {
    shimmerAnim.setValue(0);
    animationRef.current = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (layoutWidth.current !== width) {
      layoutWidth.current = width;
      if (animated) {
        animationRef.current?.stop(); // сброс
        startShimmer();
      }
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth.current, layoutWidth.current],
  });

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {animated && layoutWidth.current > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: layoutWidth.current * 2,
            transform: [{ translateX: shimmerTranslate }],
          }}
        >
          <LinearGradient
            colors={[baseColor, shimmerColor, baseColor]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default Skeleton;
