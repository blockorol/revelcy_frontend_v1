import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput, useTheme } from 'react-native-paper';
import { uploadImage } from '@api/files'; // путь поправь

const ImageUploader: React.FC = () => {
  const theme = useTheme();
    const [serverImageUri, setServerImageUri] = useState<undefined|string>(undefined);
  
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

const pickAndUploadImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    aspect: [1, 1],
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    setAvatarUri(asset.uri);

    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const file = new File([blob], 'avatar.png', { type: blob.type });

      await uploadImage(file, 'avatar');
      setUploadStatus('Uploaded successfully');
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload failed');
    }
  }
};


  return (
    <View style={styles.wrapper}>
      {/* uri */}
      <View style={{}}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
          {serverImageUri ? (
            <Image source={{ uri: `http://localhost:8080/files/image/${serverImageUri}` }} style={styles.avatarImage} />
          ) : (
            <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>?</Text>
          )}
        </View>

        <Text style={styles.label}>serverImageUri: {serverImageUri}</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          value={serverImageUri??"undefined"}
          onChangeText={(text) => {
              setServerImageUri(text ==="" ? undefined : text);
          }}
        />
      </View>

      <View>
        <TouchableOpacity onPress={pickAndUploadImage} style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>+</Text>
            )}
          </View>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Avatar</Text>
        <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>
          Click to upload image
        </Text>
        <Text style={{ color: theme.colors.primary }}>{uploadStatus}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 0,
    marginTop: 0,
    borderRadius: 4,
    height: 40,
  },
  wrapper: {
    alignItems: 'center',
    gap: 40,
    padding: 16,
    flexDirection: 'row',
  },
  avatarWrapper: {
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 16,
    marginTop: 8,
  },
  subLabel: {
    fontSize: 12,
  },
});

export default ImageUploader;
