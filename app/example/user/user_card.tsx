import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme, Switch } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { UserCard } from '@components/user/UserCard';

export default function UserCardExampleScreen() {
  const { colors } = useTheme();

  const [amount, setAmount] = useState(4);
  const [amountProcent, setAmountProcent] = useState(2.0);
  const [dayAgo, setDayAgo] = useState(2.0);
  const [isCreator, setIsCreator] = useState(true);
  const [balance, setBalance] = useState(500);
  const [isPupmInfo, setIsPupmInfo] = useState(false);
  const [isWalletInfo, setIsWalletInfo] = useState(false);
  const [isHumanityCheck, setIsHumanityCheck] = useState(false);
  
  const [followers, setFollowers] = useState(123);
  const [createdTokens, setCreatedTokens] = useState(6);
  const [trades, setTrades] = useState(32);
  const [humanity, setHumanity] = useState<'bot' | 'likely human' | 'human'>('likely human');
  const [userJoined, setUserJoined] = useState(Math.floor(Date.now() / 1000));
  const [isUserAvatar, setIsUserAvatar] = useState(false);
  const [username, setUsername] = useState("mememaster")


  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🔧 UserCard Playground</Text>

    <View style={{flexDirection: "row", alignItems: "center", alignContent:"space-between"}}>
        <View style={{flex: 1,alignContent:"center"}}>
            <UserCard
        baseInfo={{
          userId: 'u1',
          username: username,
          walletAddress: 'abc123',
          avatarUrl: isUserAvatar?'https://i.imgur.com/KZsmUi2l.png':null,
        }}
        tokenInfo={{
          userJoined,
          amount,
          amountProcent,
          isCreator,
        }}
        stats={isHumanityCheck||isWalletInfo||isPupmInfo ? {
          humanity: isHumanityCheck? humanity : undefined,
          balance: isWalletInfo? balance : undefined,
          pumpFun: isPupmInfo ?{
            followers,
            createdTokens,
            trades,
          }: undefined,
        }: undefined}
      />
       </View>
      

      {/* Sliders and inputs */}
      <View style={styles.controls}>
        <Text style={styles.label}>Amount (SOL): {amount}</Text>
        <Slider
          value={amount}
          minimumValue={0}
          maximumValue={10}
          step={0.1}
          onValueChange={setAmount}
        />

        <Text style={styles.label}>Amount %: {amountProcent}</Text>
        <Slider
          value={amountProcent}
          minimumValue={0}
          maximumValue={100}
          step={0.1}
          onValueChange={setAmountProcent}
        />
        <Text style={styles.label}>User joined: {dayAgo} days ago</Text>
        <Slider
          value={dayAgo}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onValueChange={(value) => {
            setDayAgo(value)
            setUserJoined(Date.now() - value*24*60*60*1000)
          }
          }
        />
        <Text style={styles.label}>Wallet info: <Switch value={isWalletInfo} onValueChange={setIsWalletInfo} color={colors.primary} /></Text>

        <Text style={styles.label}>Balance: {balance}</Text>
        <Slider
          value={balance}
          minimumValue={0}
          maximumValue={2000}
          step={10}
          onValueChange={setBalance}
        />

          
        
        <Text style={styles.label}>Pumpfun info: <Switch value={isPupmInfo} onValueChange={setIsPupmInfo} color={colors.primary} /></Text>
        
        <Text style={styles.label}>Followers: {followers}</Text>
        <Slider
          value={followers}
          minimumValue={0}
          maximumValue={500}
          step={1}
          onValueChange={setFollowers}
        />

        <Text style={styles.label}>Created Tokens: {createdTokens}</Text>
        <Slider
          value={createdTokens}
          minimumValue={0}
          maximumValue={50}
          step={1}
          onValueChange={setCreatedTokens}
        />

        <Text style={styles.label}>Trades: {trades}</Text>
        <Slider
          value={trades}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onValueChange={setTrades}
        />
        <Text style={styles.label}>Humanity check info: <Switch value={isHumanityCheck} onValueChange={setIsHumanityCheck} color={colors.primary} /></Text>

        <Text style={styles.label}>Humanity: {humanity}</Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <Button onPress={() => setHumanity('bot')}>bot</Button>
          <Button onPress={() => setHumanity('likely human')}>likely human</Button>
          <Button onPress={() => setHumanity('human')}>human</Button>
        </View>
        
        <Text style={styles.label}>Avatar: {isUserAvatar?"with avatar":"without avatar"}</Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <Button onPress={() => setIsUserAvatar(!isUserAvatar)}>{isUserAvatar?"remove avatar":"add avatar"}</Button>
        </View>
        
        <Text style={styles.label}>UserName: {username?"with avatar":"without avatar"}</Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <TextInput onChangeText={(text) => {setUsername(text)}}/ >
        </View>

        <Text style={styles.label}>Creator:</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button onPress={() => setIsCreator(true)} mode={isCreator ? 'contained' : 'outlined'}>true</Button>
          <Button onPress={() => setIsCreator(false)} mode={!isCreator ? 'contained' : 'outlined'}>false</Button>
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
