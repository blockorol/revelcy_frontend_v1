import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { AboutCommunity } from '@components/premarket/AboutCommunity';
import useIsMobile from '@hooks/useIsMobile';
import Slider from '@react-native-community/slider';

export default function UserCardExampleScreen() {
  const [description, setDescription] = useState("SomeDescription")
  const [tokenBannerURL, setTokenBannerURL] = useState<undefined|string>(undefined)
  const [isCreator, setIsCreator] = useState(false)
  const [width, setWidth] = useState<number>(400)
  const isMobile = useIsMobile()


  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🔧 UserCard Playground</Text>

    <View style={{flexDirection: "row", alignItems: "center", alignContent:"space-between"}}>
        <View style={{flex: 1,alignContent:"center"}}>
            <AboutCommunity communityInfo={{
                    description: description,
                    tokenBannerURL: tokenBannerURL,
                    links: undefined,
                  }
            } 
            premarketPubkey={"test"}
            isMobile={isMobile}
            isCreator={isCreator}
            width={width}
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
        
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <Slider
            style={styles.controls}
            minimumValue={1}
            maximumValue={1000}
            step={1}
            value={width}
            onValueChange={(v: React.SetStateAction<number>)=>{setWidth(v)}}
            minimumTrackTintColor={'green'}
            maximumTrackTintColor="#ddd"
          />
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
