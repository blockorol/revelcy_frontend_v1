import React, { useState } from 'react';
import { TextInput, useTheme, Checkbox  } from 'react-native-paper';
import { View, Text, StyleSheet  } from 'react-native';
import Slider from '@react-native-community/slider';
import EditPremarketSettingsForm from '@components/token/create/EditPremarketSettings';
import { PremarketSettingData } from '@components/token/create/interface';

export default function LoginUsername() {
  
  const [responseOk, setResponseOk] = useState<boolean>(false);
  const [responseAlreadyExist, setResponseAlreadyExist] = useState<boolean>(false);
  
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(600);


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
        <EditPremarketSettingsForm
          onNext={(data: PremarketSettingData) => { } }
          onClose={() => { } } 
          step={0} 
          totalSteps={3}
        />

      </View>
      <View style={styles.container}>
        
      {/* response */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Response: {"{\n"}ok: {responseOk?"true":"false"},{"\n"} reason:{responseAlreadyExist ? "already exist" : undefined} {"\n}"}</Text>
        <Checkbox.Item 
          color={theme.colors.secondary}
          label='success'
          status={responseOk ? 'checked' : 'unchecked'}
          onPress={() => {
            if (!responseOk) {
              setResponseAlreadyExist(false)
            }
            setResponseOk(!responseOk)
          }}/>
        <Checkbox.Item 
          color={theme.colors.secondary}
          label='already exist'
          status={responseAlreadyExist ? 'checked' : 'unchecked'}
          onPress={() => {
            setResponseAlreadyExist(!responseAlreadyExist)
            if (!responseAlreadyExist) {
              setResponseOk(false)
            }
          }}/>
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
