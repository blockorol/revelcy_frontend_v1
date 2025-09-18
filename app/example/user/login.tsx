import React, { useState } from 'react';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { View, Text, StyleSheet  } from 'react-native';
import Slider from '@react-native-community/slider';
import WalletConnectionChecker from '@components/login/WalletConnectionCheckerArea';
import { useWallet } from '@storage/wallet-adapter';
import { router } from 'expo-router';

export default function LoginScreen() {
  
  const { connected, publicKey, disconnect } = useWallet();
  const [date, setDate] = useState<undefined|string>(undefined);
  const [balance, setBalance] = useState<number>(-1);
  const [humanity, setHumanity] = useState<number>(-1);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(600);

  const handleBalanceChange = (value: number) => {
    setBalance(Math.round(value));
  };
  const handleHumanityChange = (value: number) => {
    setHumanity(value);
  };

  const handleHeightChange = (value: number) => {
    setHeight(Math.round(value));
  };
  const handleWidthChange = (value: number) => {
    setWidth(Math.round(value));
  };

  const theme = useTheme()
  const colors = theme.colors
  return (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: "space-between" , gap: 10 }}>
      <View style={{width:width+10, height:height+10, padding:5, backgroundColor:colors.surfaceVariant, justifyContent: "center"}}>
        <WalletConnectionChecker
          width={width}
          height={height}
          toBack={()=>{}}
          toNext={()=>{router.push('/example/login_username')}}
          walletConnectionDate={date}
          balance={balance != -1 ?balance:undefined}
          humanity={humanity != -1 ?humanity:undefined}
        />
      </View>
      <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Text>Wallet {connected?`connected to ${publicKey}`: "not connected"}</Text>
        {connected && (<Button mode="contained" onPress={disconnect} children={"Disconnect"} />)}
      </View>

      
        
      {/* Date */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Date: {date}</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          value={date??"undefined"}
          onChangeText={(text) => {
            setDate(text);
          }}
        />
      </View>

      {/* Balance */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Balance: {balance === -1 ? "undefined" : balance}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-1}
          maximumValue={1000}
          step={1}
          value={balance}
          onValueChange={handleBalanceChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ddd"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={balance.toString()}
          onChangeText={(text) => {
            const val = parseFloat(text);
            if (!isNaN(val) && val >= -1 && val <= 1000) {
              setBalance(val);
            }
          }}
        />
      </View>
      
      {/* humanity */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Humanity: {humanity < 0 ? "undefined" : humanity}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-0.01}
          maximumValue={1}
          step={0.01}
          value={humanity}
          onValueChange={handleHumanityChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ddd"
        />
        <TextInput
          style={styles.input}
          keyboardType='numbers-and-punctuation'
          value={humanity.toString()}
          onChangeText={(text) => {
            const val = parseFloat(text);
            if (!isNaN(val) && val >= -1 && val <= 1000) {
              setHumanity(val);
            }
          }}
        />
      </View>

      

      {/* Width */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Width: {width}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={1000}
          step={1}
          value={width}
          onValueChange={handleWidthChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ddd"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={width.toString()}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val) && val >= 1 && val <= 1000) {
              setWidth(val);
            }
          }}
        />
      </View>
      
      {/* Height */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Height: {height}</Text>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={1000}
          step={1}
          value={height}
          onValueChange={handleHeightChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ddd"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height.toString()}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val) && val >= 1 && val <= 1000) {
              setHeight(val);
            }
          }}
        />
      </View>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sliderContainer: {
    marginBottom: 0,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 0,
    marginTop: 0,
    borderRadius: 4,
        height: 40,

  },
});
