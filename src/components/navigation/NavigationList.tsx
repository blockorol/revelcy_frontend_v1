// components/NavigationList.tsx
import { View, StyleSheet } from 'react-native';
import { NavigationItem } from './NavigationItem';
import { useTheme } from 'react-native-paper';
import { navigationItems } from '@components/navigation/NavigationItems';

export interface Props {
  isMobile: boolean
}

export function NavigationList({isMobile}:Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        isMobile ? styles.mobileContainer : styles.desktopContainer,
      ]}
    >
      {navigationItems.map((navigationItem)=>
        <NavigationItem
          isMobile={isMobile}
          iconActive={navigationItem.iconActive}
          iconNotActive={navigationItem.iconNotActive}
          label={navigationItem.label}
          route={navigationItem.route}
          horizontal={!isMobile}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'flex-start',
  },
});
