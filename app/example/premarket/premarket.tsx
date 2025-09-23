import React, { useState } from 'react';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { View, Text, StyleSheet, Linking   } from 'react-native';
import Slider from '@react-native-community/slider';
import { useWallet } from '@storage/wallet-adapter';
import { joinToPremarket } from '@services/blockchain/premarket/joinPremarket';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWalletSafe } from '@storage/wallet-adapter/useWallet.web';
import { outOfPremarket } from '@services/blockchain/premarket/outOfPremarket';
import { finishPremarket } from '@services/blockchain/premarket/finishPremarket';
import BN from 'bn.js';
import { SolanaNetwork, useNetwork } from '@providers/NetworkContext';
import { getSolanaConnection } from '@services/blockchain/solana';

export default function JoinScreen() {
  const {network, setNetwork} = useNetwork()
  const { connected, publicKey, disconnect, connect } = useWallet();
    const wallet = useAnchorWalletSafe();
  
  const [txID, setTxId] = useState<string>("");
  const [balance, setBalance] = useState<number>(-1);
  const [premarketPDA, setPremarketPDA] = useState("");

  const currentConnection = getSolanaConnection(network);
  const getOtherNetwork= (network:SolanaNetwork):SolanaNetwork=> {
    return network === 'devnet' ? 'mainnet-beta':'devnet'
  }
  const handleBalanceChange = (value: number) => {
    setBalance(Math.round(value));
  };

  const theme = useTheme()
  const colors = theme.colors

  return (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: "space-between" , gap: 10 }}>
      <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Text> {network}</Text>
        <Button onPress={()=>{setNetwork(getOtherNetwork(network))}}>SetNetwork {getOtherNetwork(network)}</Button>
        <Button onPress={()=>{connect()}}>Connect</Button>
        <Text>Wallet {connected?`conneccted to ${publicKey}`: "not connected"}</Text>
        {connected && (<Button mode="contained" onPress={disconnect} children={"Disconnect"} />)}
      </View>

      <View style={{flexDirection:"row"}}>
        <View>
          
          {/* Balance */}
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Balance: {balance === -1 ? "undefined" : balance/1000000000} SOL</Text>
            <Slider
              style={styles.slider}
              minimumValue={-1}
              maximumValue={20000000}
              step={10000}
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
                if (!isNaN(val) && val >= -1 && val <= 100) {
                  setBalance(val);
                }
              }}
            />
          </View>
          
          {/* premarketPDA */}
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>premarketPDA: {premarketPDA}</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setPremarketPDA(text)
              }}
            />
          </View>

          <Button onPress={async () =>
          {
            setTxId("")
             const premarketPDAPub = new PublicKey(premarketPDA)
            if (!wallet) {
              console.log("FAIL")
              return 
            }
            
            if (network === 'testnet') {
              console.error("testnet! failed")
              return
            }

            console.log(premarketPDA, "->", premarketPDAPub.toString())
            const res = await joinToPremarket(wallet, currentConnection, network, premarketPDAPub, new BN(balance), new BN(balance+100))
            setTxId(res.txId)
          }
          }>Join</Button>

          
          <Button onPress={ async() =>
          {
            setTxId("")
            const premarketPDAPub = new PublicKey(premarketPDA)
            if (!wallet) {
              console.log("FAIL")
              return 
            }
            
            if (network === 'testnet') {
              console.error("testnet is not supported")
              return
            }
            const res = await outOfPremarket(wallet, currentConnection, network, premarketPDAPub)
            setTxId(res.txId)

          }
          }>out of premarket</Button>

          <Button onPress={ async () =>
          { 
            setTxId("")
            const premarketPDAPub = new PublicKey(premarketPDA)

            if (!wallet) {
              console.log("FAIL")
              return 
            }
            if (network === 'testnet') {
              console.error("testnet is not supported")
              return
            }
            const res = await finishPremarket(wallet, currentConnection,network, premarketPDAPub)
            setTxId(res.txId)
          }
          }>finish premarket</Button>
        </View>
      </View>

      <Text>
        {txID ? (
          <Text
            style={{ color: 'blue' }}
            onPress={() => Linking.openURL(`https://solscan.io/tx/${txID}?cluster=devnet`)}
          >
            txID: {txID}
          </Text>
        ) : (
          'транзакция не отправлена'
        )}
      </Text>


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
    maxWidth: 700,
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
    maxHeight: 700,
    maxWidth: 700,
    borderRadius: 4,
        height: 40,
  },
});

