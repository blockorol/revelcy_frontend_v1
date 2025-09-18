import React from 'react';
import OneScreenContainer from '@components/base/container/OneScreenContainer';
import Skeleton from '@components/Skeleton';

export default function LoadingScreen() {
  
  return (
    <OneScreenContainer  backgroundColor="#f2f2f2">
      <Skeleton height={1000} width={"100%"} animated={true} />
    </OneScreenContainer>
  );
}
