import React from "react";
import { ScrollView, View, StyleSheet, Linking } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";
import { Text } from "@components/ui/Text";

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

const HorizontalButtons: React.FC<{ width: number; links: Link[] }> = ({
  width,
  links,
}) => {
  const { colors } = useTheme();

  const getIconName = (type: Link["type"]) =>
    type === "x" ? "x-logo" : type === "tg" ? "tg-logo" : "world-outlined";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        width: width - 24,
        alignSelf: "stretch",
        flexGrow: 0,
        flexShrink: 0,
      }}
      contentContainerStyle={styles.hContent}
    >
      {links.map((link) => (
        <View key={link.url} style={styles.hItem}>
          <Button
            mode="outlined"
            style={{ flexShrink: 0, padding: 0 }}
            contentStyle={{ paddingRight: 0, height: 30, borderRadius: 14 }}
            labelStyle={{ marginRight: 20 }}
            textColor={colors.onBackground}
            onPress={() => Linking.openURL(link.url)}
            icon={() => (
              <SvgIcon
                name={getIconName(link.type)}
                color={colors.onBackground}
                size={20}
              />
            )}
          >
            <Text prominent variant="labelMedium">
              {link.text}
            </Text>
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

  return (
    <View style={styles.flowWrap}>
      {links.map((link, i) => (
        <Button
          key={`${link.url}-${i}`}
          mode="outlined"
          style={styles.flowItem}
          contentStyle={{ paddingRight: 0, height: 30, borderRadius: 14 }}
          labelStyle={{ marginRight: 20 }}
          textColor={colors.onBackground}
          onPress={() => Linking.openURL(link.url)}
          icon={() => (
            <SvgIcon
              name={getIconName(link.type)}
              color={colors.onBackground}
              size={20}
            />
          )}
        >
          <Text prominent variant="labelMedium">{link.text}</Text>
        </Button>
      ))}
    </View>
  );
};
const GAP = 12;

const styles = StyleSheet.create({
  // mobile
  hContent: {
    paddingHorizontal: 8,
  },
  hItem: {
    marginRight: 12,
    flexShrink: 0,
  },

  // desktop grid
  flowWrap: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    // если gap поддерживается — можно просто: gap: GAP,
    marginHorizontal: -GAP / 2, // polyfill gap по горизонтали
    marginVertical: -GAP / 2,   // polyfill gap по вертикали
  },
  flowItem: {
    // каждая кнопка занимает свою естественную ширину
    alignSelf: "flex-start",
    padding: 0,
    // polyfill gap:
    marginHorizontal: GAP / 2,
    marginVertical: GAP / 2,
  },
});
