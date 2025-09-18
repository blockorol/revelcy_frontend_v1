import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { AboutCommunity } from '@components/premarket/AboutCommunity';

export default function UserCardExampleScreen() {
  const [isUserAvatar, setIsUserAvatar] = useState(false);
  const [description, setDescription] = useState("SomeDescription")
  const [tokenBannerURL, setTokenBannerURL] = useState<undefined|string>(undefined)
  const [isCreator, setIsCreator] = useState(false)


  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🔧 UserCard Playground</Text>

    <View style={{flexDirection: "row", alignItems: "center", alignContent:"space-between"}}>
        <View style={{flex: 1,alignContent:"center"}}>
            <AboutCommunity communityInfo={{
                    description: description,
                    tokenBannerURL: tokenBannerURL,
                    links: undefined}

            } 
            premarketPubkey={"test"}
            isCreator={isCreator}
            />
       </View>
      

      {/* Sliders and inputs */}
      <View style={styles.controls}>
        <View style={{ flexDirection: 'column', gap: 10 }}>
            <Button onPress={() => setTokenBannerURL(undefined)}>{"remove banner"}</Button>
        </View>
        
        <Text style={styles.label}>Creator: {isCreator?"it's creator": "it is not creator"}</Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
            <Button onPress={() => setIsCreator(!isCreator)}>{"change"}</Button>
        </View>
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  controls: {
    width: 200,
    marginTop: 20,
    paddingBottom: 100,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
