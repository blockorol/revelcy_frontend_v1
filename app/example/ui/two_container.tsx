import React from 'react';
import { Surface } from 'react-native-paper';
import TwoScreensContainer from '@components/base/container/TwoScreensContainer';
import Skeleton from '@components/Skeleton';

const LoadingTwoScreen = () => {
  return (
    <TwoScreensContainer
      backgroundColor="#f2f2f2"
      left={
        <Surface style={{borderRadius: 12 }}>
          <Skeleton baseColor={"#fff"} height={200} width="100%" />
        </Surface>
      }
      right={
        <Surface style={{borderRadius: 12 }}>
          <Skeleton  baseColor={"#aaa"}  height={1400} width="100%" />
        </Surface>
      }
    />
  );
};

export default LoadingTwoScreen;
