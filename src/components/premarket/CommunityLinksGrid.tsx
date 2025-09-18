import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { SvgIcon } from '@components/base/SvgIcon';

interface Link {
  text: string;
  url: string;
  type: 'x' | 'tg' | 'other';
}

interface CommunityLinksGridProps {
  links: Link[];
}

export const CommunityLinksGrid: React.FC<CommunityLinksGridProps> = ({ links }) => {
  const { colors } = useTheme();

  const getIconName = (type: Link['type']) => {
    switch (type) {
      case 'x':
        return 'x-logo';
      case 'tg':
        return 'tg-logo';
      default:
        return 'world-outlined';
    }
  };

  const rows = [];
  for (let i = 0; i < links.length; i += 2) {
    rows.push(links.slice(i, i + 2));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((link, index) => (
            <View key={index} style={styles.cell}>
              <Button
                mode="outlined"
                textColor={colors.onBackground}
                onPress={() => Linking.openURL(link.url)}
                icon={() => (
                  <SvgIcon name={getIconName(link.type)} color={colors.onBackground} size={20} />
                )}
              >
                {link.text}
              </Button>
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />} {/* заполнитель для выравнивания */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cell: {
    flex: 1,
  },
});
