import React from "react";
import { ScrollView, View, StyleSheet, Linking } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";

interface Link {
  text: string;
  url: string;
  type: "x" | "tg" | "other";
}

interface CommunityLinksGridProps {
  width: number;
  isMobile: boolean;
  links: Link[];
}

export const CommunityLinksGrid: React.FC<CommunityLinksGridProps> = ({
  width,
  links,
  isMobile,
}) => {
  return isMobile ? (
    <HorizontalButtons links={links} width={width} />
  ) : (
    <DesktopGrid links={links} />
  );
};

const HorizontalButtons: React.FC<{ width: number, links: Link[] }> = ({ width, links }) => {
  const { colors } = useTheme();

  const getIconName = (type: Link["type"]) =>
    type === "x" ? "x-logo" : type === "tg" ? "tg-logo" : "world-outlined";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{width: width - 24, alignSelf: "stretch", flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={styles.hContent}
    >
      {links.map((link) => (
        <View key={link.url} style={styles.hItem}>
          <Button
            mode="outlined"
            style={[styles.hButton, { flexShrink: 0 }]}
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
    </ScrollView>
  );
};


const DesktopGrid: React.FC<{ links: Link[] }> = ({ links }) => {
  const { colors } = useTheme();
  const getIconName = (t: Link["type"]) =>
    t === "x" ? "x-logo" : t === "tg" ? "tg-logo" : "world-outlined";

  const rows: Link[][] = [];
  for (let i = 0; i < links.length; i += 2) rows.push(links.slice(i, i + 2));

  return (
    <View style={[styles.grid, { padding: 8 }]}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((link, i) => (
            <View key={i} style={styles.cell}>
              <Button
                mode="outlined"
                textColor={colors.onBackground}
                onPress={() => Linking.openURL(link.url)}
                style={styles.dButton}
                icon={() => (
                  <SvgIcon name={getIconName(link.type)} color={colors.onBackground} size={20} />
                )}
              >
                {link.text}
              </Button>
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // mobile
  hContent: {
    paddingHorizontal: 8,
    // Не используем gap внутри горизонтального ScrollView на RNW — бывают баги с шириной
  },
  hItem: {
    marginRight: 12,
    flexShrink: 0,       // КРИТИЧНО: элемент не сжимается => контент шире контейнера => появляется скролл
  },
  hButton: {
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: "center",
    // marginHorizontal: 2 — не обязателен
  },


  // desktop grid
  grid: {
    width: "100%",
    gap: 12,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cell: {
    flex: 1,
  },
  dButton: {
    height: 40,
    // borderRadius: 14,
    borderRadius: 20,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
});
