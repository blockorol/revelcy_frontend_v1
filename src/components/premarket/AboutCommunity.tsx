import { TokenCommunityInfo, updateAboutCommunity } from "@api/token";
import { CommunityLinksGrid } from "@components/premarket/CommunityLinksGrid";
import { View, Image } from "react-native";
import { useTheme, Text, Button } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';
import { useState } from "react";
import CustomizeTokenForm from "@components/token/create/CustomizeTokenForm";
import { CustomizeTokenData } from "@components/token/create/interface";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import { uploadImage } from "@api/files";
import { ExtendedMD3Colors } from "@theme/types";
import { useOverlay } from "@storage/UniversalOverlayProvider";

interface AboutCommunityProps {
  premarketPubkey: string;
  communityInfo?: TokenCommunityInfo;
  isCreator?: boolean;
}

export function AboutCommunity({ premarketPubkey, communityInfo, isCreator }: AboutCommunityProps) {
  const [communityInfoLocal, setCommunityInfo] = useState(communityInfo);
  const { open, close } = useOverlay();
  const colors = useTheme().colors as ExtendedMD3Colors;

  if (
    !isCreator &&
    (!communityInfoLocal ||
    (communityInfoLocal.description === "" &&
      (!communityInfoLocal.links || communityInfoLocal.links.length === 0) &&
      !communityInfoLocal.tokenBannerURL))
  ) {
    return <View />;
  }

  const openEdit = () => {
    open(
      <OneScreenContainer backgroundColor={colors.shadow}>
        <CustomizeTokenForm
          onNext={async (data: CustomizeTokenData) => {
            const next: TokenCommunityInfo = {
              ...communityInfoLocal,
              ...data,
              description: data.description ?? "",
              tokenBannerURL: communityInfoLocal?.tokenBannerURL,
            };

            if (data.banner?.data) {
              const response = await fetch(data.banner.data);
              const blob = await response.blob();
              const fileName = `${premarketPubkey}_banner`;
              const file = new File([blob], `${fileName}.png`, { type: blob.type });
              const url = await uploadImage(file, fileName);
              next.tokenBannerURL = url;
            } else if (data.banner?.url) {
              next.tokenBannerURL = data.banner.url;
            }

            setCommunityInfo(next);

            if (premarketPubkey !== "test") {
              await updateAboutCommunity(premarketPubkey, next);
            }

            close();
          }}
          onClose={close}
          presetData={{
            ...communityInfoLocal,
            banner: { url: communityInfoLocal?.tokenBannerURL },
          }}
        />
      </OneScreenContainer>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 20,
        padding: 24,
        gap: 32,
      }}
    >
      {!!communityInfoLocal?.tokenBannerURL && (
        <Image
          source={{ uri: communityInfoLocal.tokenBannerURL }}
          resizeMode="contain"
          style={{
            height: 272,
            borderRadius: 20,
            backgroundColor: colors.surfaceContainerLowest,
            padding: 24,
            paddingBottom: 32,
          }}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {!!communityInfoLocal?.description ? (
          <View style={{ gap: 24, flex: 1 }}>
            <Text variant="titleLarge">
              About Community{" "}
              {isCreator && (
                <Button mode='outlined' onPress={openEdit}>Edit</Button>
              )}
            </Text>

            <ExpandableText text={communityInfoLocal.description} maxLineExpanded={2} />
          </View>
        ) : isCreator && (
            <Button onPress={openEdit}>Add comunity info</Button>
          )
        }

        {communityInfoLocal?.links && communityInfoLocal.links.length !== 0 && (
          <View style={{ flex: 1 }}>
            <CommunityLinksGrid links={communityInfoLocal.links} />
          </View>
        )}
      </View>
    </View>
  );
}
