import React, { createContext, useContext, useState, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface ContentAreaContextProps {
  contentHeight: number;
  setTopHeight: (h: number) => void;
  setBottomHeight: (h: number) => void;
  topHeight: number;
  bottomHeight: number;
}

const ContentAreaContext = createContext<ContentAreaContextProps | null>(null);

export const ContentAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [topHeight, setTopHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);

  const contentHeight = useMemo(
    () => windowHeight - topHeight - bottomHeight,
    [windowHeight, topHeight, bottomHeight]
  );

  return (
    <ContentAreaContext.Provider
      value={{ contentHeight, setTopHeight, setBottomHeight, topHeight, bottomHeight }}
    >
      {children}
    </ContentAreaContext.Provider>
  );
};

export const useContentArea = () => {
  const ctx = useContext(ContentAreaContext);
  if (!ctx) throw new Error('useContentArea must be used within a ContentAreaProvider');
  return ctx;
};
