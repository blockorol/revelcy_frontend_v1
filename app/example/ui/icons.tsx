import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SvgIcon, IconName, icons as iconObj } from '@components/base/SvgIcon'; // поправь путь при необходимости
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

const AllIconsScreen: React.FC = () => {
  const {colors} = useTheme()
  const icons = Object.keys(iconObj) as IconName[];
  const [iconColor, setIconColor] = useState('red');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [iconSize, setIconSize] = useState(24);

  const handleIconSizeChange = (value: number) => {
    setIconSize(Math.round(value));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputsContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Icon Color:</Text>
          <TextInput
            style={styles.input}
            value={iconColor}
            onChangeText={setIconColor}
            placeholder="Enter color (e.g. red or #ff0000)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Background Color:</Text>
          <TextInput
            style={styles.input}
            value={backgroundColor}
            onChangeText={setBackgroundColor}
            placeholder="Enter color (e.g. white or #ffffff)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>icon size</Text>
            <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={iconSize}
            onValueChange={handleIconSizeChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="#ddd"
            />
          
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={iconSize.toString()}
            onChangeText={(text) => {
                const val = parseInt(text, 10);
                if (!isNaN(val) && val >= 1 && val <= 100) {
                setIconSize(val);
                }
            }}
            placeholder="Enter icon size"
            />
        </View>
      </View>

      <View style={styles.grid}>
        {icons.map((name) => (
          <View key={name} style={[styles.iconContainer, {width: iconSize+10}]}>
            <SvgIcon
              name={name}
              size={iconSize}
              color={iconColor}
              style={{backgroundColor:backgroundColor, marginBottom: 4}}
            />
            <Text style={styles.iconLabel}>{name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    
  inputsContainer: {
    marginBottom: 16,
  },
  
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    marginRight: 8,
    width: 120,
  },
  input: {
    flex: 1,
    backgroundColor: '#555',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  slider: {
    flex: 1,
    height: 30,
  },

  container: {
    flex: 1,
    backgroundColor: '#333', // темно-серый фон
    padding: 16,
  },
  grid: {
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    // flex: 1,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  iconLabel: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    maxHeight: 100
  },
  iconSize: {
    color: '#bbb',
    fontSize: 10,
  },
});

export default AllIconsScreen;
