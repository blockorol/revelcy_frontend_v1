import React, { useState } from 'react';
import { TextInput, useTheme, Checkbox, Button  } from 'react-native-paper';
import { View, Text, StyleSheet  } from 'react-native';
import { useAuth } from '@storage/AuthContext';
import { NavigationProfileWidget } from '@components/navigation/NavigationProfileWidget';

export default function LoginUsername() {
  const { login, logout, user } = useAuth();
  const [jwt, setJwt] = useState("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMzIzYTU1ZC1lZjNlLTRhMDQtODI1My0wNWQxMWExMjcyNzAiLCJ1c2VyX2lkIjoiYTMyM2E1NWQtZWYzZS00YTA0LTgyNTMtMDVkMTFhMTI3MjcwIiwidXNlcm5hbWUiOiI1NjY3NzQ0IiwiYXZhdGFyX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9maWxlcy9pbWFnZS9hMzIzYTU1ZC1lZjNlLTRhMDQtODI1My0wNWQxMWExMjcyNzAucG5nIiwiY3VycmVudF93YWxsZXQiOiJKc1l6WkZxQjZmYVdoQUJNTjY2TUY1UWt6Vk5EQXlROG9EN3RxOFJkdDVvIiwibm9uY2UiOiJPNXlzMUtaTzdzYnhYTGZvb1hKVzVzeVI2REJwTFRQMiIsImV4cCI6MjAwMDAwMDAwMH0.JdYjYH9avfKGpmIqG_ygDc-un7r6b1UdaNm4EwvTD4s")
   
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
