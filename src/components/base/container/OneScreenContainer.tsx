import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { useIsMobileForOneScreenWithDemention } from '@hooks/useIsMobile';

interface OneScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const OneScreenContainer: React.FC<OneScreenContainerProps> = ({ children, backgroundColor}) => {
  const {isMobile, width} = useIsMobileForOneScreenWithDemention();

  return (
    <View style={{ flex: 1, backgroundColor, width}}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          // { flexGrow: 1, alignItems: 'center' }
          isMobile ? { flexGrow: 1, alignItems: 'center' } : { justifyContent: 'center', minHeight: '100%' }
        ]}
      >
        <View>
          <Surface style={styles.surface}>
              {children}
          </Surface>
        </View>
      </ScrollView>
    </View>

  );
};


const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  surface: {
    elevation: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
});

export default OneScreenContainer;
