import { TokenMainInfo } from "@api/token";
import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { Button } from "@components/ui/Button";
import { ExtendedMD3Colors } from "@theme/types";
import { openInBrowser } from "@utils/openLinks";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ConceptShowProps {
  tokenMainInfo: TokenMainInfo;
  isMobile: boolean;
}

export function ConceptShow({ tokenMainInfo, isMobile }: ConceptShowProps) {
  const colors = useTheme().colors as ExtendedMD3Colors;
  const links = [
    tokenMainInfo.links.twitter
      ? { label: "X", icon: "x-logo" as const, url: tokenMainInfo.links.twitter }
      : null,
    tokenMainInfo.links.telegram
      ? { label: "Telegram", icon: "tg-logo" as const, url: tokenMainInfo.links.telegram }
      : null,
    tokenMainInfo.links.webSite
      ? { label: "Website", icon: "world-outlined" as const, url: tokenMainInfo.links.webSite }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <View
      style={{
        backgroundColor: isMobile ? "transparent" : colors.surfaceContainerLowest,
        borderRadius: isMobile ? undefined : 20,
        padding: isMobile ? 16 : 24,
        gap: 16,
        width: "100%",
      }}
    >
      <View style={{ gap: 24, alignItems: "center"}}>
        <SvgIcon name="eyes" size={56} color={colors.onSurface} />
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          More info coming soon - Follow the Project
        </Text>
        
        {links.length > 0 && (
          <View style={{ flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", gap: 12 }}>
            {links.map((link) => (
              <RoundIconLink
                key={link.url}
                // style={{ borderRadius: 9999, padding: 8,  }}
                // colors={colors.onSurface}
                name={link.icon}
                link={link.url}
                colors={colors}
                withoutBackgroud
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
