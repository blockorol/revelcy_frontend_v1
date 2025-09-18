import React, { useState } from 'react';
import Skeleton from '@components/Skeleton';
import ImageBackgroundOverlay from '@components/base/container/ImageBackgroundOverlay';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { View, StyleSheet  } from 'react-native';
import Slider from '@react-native-community/slider';

export default function LoadingScreen() {
  const [crossing, setCrossing] = useState(100);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(600);
  const handleCrossingChange = (value: number) => {
    setCrossing(Math.round(value));
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
      <View style={{width:"auto", justifyContent: "center"}}>
        <ImageBackgroundOverlay
          image={require('@assets/background_faces_with_revelcy.png')}
          backgroundColor={theme.colors.background}
          width={width}
          height={height}
          crossingItems={crossing}
        >
          <Text style={{color:theme.colors.onBackground}}> crossingItems {crossing}</Text>
        </ImageBackgroundOverlay>
      </View>
      <View style={styles.container}>
      {/* Crossing */}
      <View style={styles.sliderContainer}>
        <Text variant='bodyLarge' style={styles.label}>Crossing: {crossing}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={1000}
          step={1}
          value={crossing}
          onValueChange={handleCrossingChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ddd"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={crossing.toString()}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val) && val >= 1 && val <= 1000) {
              setCrossing(val);
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
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
});
