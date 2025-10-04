import { TokenCommunityInfo, updateAboutCommunity } from "@api/token";
import { CommunityLinksGrid } from "@components/premarket/CommunityLinksGrid";
import { View, Image, ScrollView } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { Text } from "@components/ui/Text"
import { ExpandableText } from "@components/base/ExpandableText";
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
  width: number;
  isMobile: boolean;
  isCreator?: boolean;
}

export function AboutCommunity({
  premarketPubkey,
  communityInfo,
  isCreator,
  width,
  isMobile,
}: AboutCommunityProps) {
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
    return null;
  }

  const bannerUri = communityInfoLocal?.tokenBannerURL;
  const bannerRatio = 3/1;

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
              const file = new File([blob], `${fileName}.png`, {
                type: blob.type,
              });
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
        backgroundColor: isMobile
          ? "transperent"
          : colors.surfaceContainerLowest,
        borderRadius: isMobile ? undefined : 20,
        padding: isMobile ? 16 : 24,
        gap: isMobile ? 24 : 32,
        width: "100%",
      }}
    >
      {!!bannerUri && (
  <View
    style={{
      width: "100%",
      aspectRatio: 3,               
      borderRadius: 20,
      overflow: "hidden",          
      backgroundColor: colors.surfaceContainerLowest,
    }}
  >
    <Image
      source={{ uri: bannerUri }}
      style={{
        width: "100%",
        height: "100%",
        // @ts-ignore
        objectFit: "cover",
        // @ts-ignore
        objectPosition: "center",
      }}
      resizeMode="cover"
    />
  </View>
)}
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          alignItems: "flex-start",
          gap: 16,
          justifyContent: isMobile ? 'center' : "space-between",
        }}
      >
        {!!communityInfoLocal?.description ? (
          <View style={{flex: 1,  gap: isMobile ? 16:24, alignContent: 'flex-start', justifyContent: 'flex-start'}}>
            <View style={{flex:1, flexDirection: "row", gap: isMobile ? 8 : 16, alignItems: 'center', }}>
              <Text variant="titleLarge">About Community</Text>
              {isCreator && (
                <Button
                  mode="outlined"
                  onPress={openEdit}  
                  style={{ borderRadius: 8, paddingHorizontal:0, margin:0 }}
                  contentStyle={{ height: 30, paddingHorizontal: 16, margin:0 }}
                  labelStyle={{margin:0}}
                >
                  <Text prominent variant='labelMedium'>Edit</Text>
                </Button>
              )}
            </View>
            <View>
              <ExpandableText
                text={communityInfoLocal.description}
                maxLineExpanded={2}
              />
              
            </View>
          </View>
        ) : (
          isCreator && (
            
                <Button
                  mode="outlined"
                  onPress={openEdit}  
                  style={{ borderRadius: 8, paddingHorizontal:0, margin:0 }}
                  contentStyle={{ height: 30, paddingHorizontal: 16, margin:0 }}
                  labelStyle={{margin:0}}
                >
                  <Text prominent variant='labelMedium'>Add comunity info</Text>
                </Button>
          )
        )}

        {communityInfoLocal?.links && communityInfoLocal.links.length !== 0 && (
          <View> 
            <CommunityLinksGrid
              links={communityInfoLocal.links}
              isMobile={isMobile}
              width={width}
            />
          </View>
        )}
      </View>
    </View>
  );
}
