import { useState } from 'react';
import { TextInput, useTheme, Button  } from 'react-native-paper';
import { View, Text  } from 'react-native';
import { useAuth } from '@providers/AuthContext';
import { NavigationProfileWidget } from '@components/navigation/NavigationProfileWidget';

export default function LoginUsername() {
  const { login, logout, user } = useAuth();
  const [jwt, setJwt] = useState("")
   
  const theme = useTheme()
  const colors = theme.colors

  return (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: "space-between" , gap: 10 }}>
      <View style={{width:300, height:300, padding:5, backgroundColor:colors.surfaceVariant, justifyContent: "center"}}>
        <NavigationProfileWidget/>
      </View>

      <View style={{width:300, height:300, padding:5, backgroundColor:colors.surfaceVariant, justifyContent: "center"}}>
        <TextInput 
         label="jwt"
         onChangeText={(text) => {
            setJwt(text)
            }}/>
        {
            user === null ?
                <Text > user not installed</Text> :
                <>
                    <Text>username:{user.username}</Text>
                    <Text>userId:{user.userId}</Text>
                    <Text>avatarUrl:{user.avatarUrl??"null"}</Text>
                    <Text>wallet:{user.walletAddress}</Text>
                </>
        }
      </View>
      
      <View style={{width:300, height:300, padding:5, backgroundColor:colors.surfaceVariant, justifyContent: "center"}}>
        <Button onPress={() => {
            login(jwt)
        }}> login</Button>
        <Button onPress={() => logout()}> logout</Button>
      </View>
  </View>
  );
};
