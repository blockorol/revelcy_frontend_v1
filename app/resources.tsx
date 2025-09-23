import React from "react";
import { Text } from "react-native-paper";
import { ScrollView } from "react-native";

export default function ExampleIndex() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant='bodyMedium' style={{color: 'black'}}> Here will be Gitbook</Text>
    </ScrollView>
  );
}
