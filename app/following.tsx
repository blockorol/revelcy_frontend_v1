import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput, Text} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useNetwork } from '@storage/NetworkContext';

const ExampleNavigationButtons = () => {
  const router = useRouter();
  const [pda, setPDA] = useState("")
  const {network} = useNetwork()

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text variant='bodyMedium' style={{color: 'black'}}> Version 0.0.17; network: {network.toString()}</Text>
      <View style={{flexDirection:"row"}}>
        <TextInput placeholder='premarketPDA' onChangeText={(val) => setPDA(val)} style={{flex:1}}/>
        <Button mode="contained" onPress={() => router.push(`/token/${pda}`)}>
          Premarket Page
        </Button>
      </View>

      <Button mode="contained" onPress={() => router.push('/example')}>
         Examples
      </Button>
    </View>
  );
};

export default ExampleNavigationButtons;
