import React from 'react';
import { Text, useTheme } from 'react-native-paper';
import { Linking, StyleSheet, View } from 'react-native';

const TermsOfServiceURL = 'https://example.com/terms'
const PrivacyPolicyURL = 'https://example.com/privacy'

export function TermsNotice() {
  const { colors } = useTheme();

  const openLink = (url: string) => Linking.openURL(url);

  return (
    <View style={styles.wrapper}>
      <Text variant="labelMedium" style={[styles.text, { color: colors.onSurfaceVariant }]}>
        By continuing, you agree to our{'\n'}
        <Text
          variant="labelMedium"
          style={[styles.link, { color: colors.onSurfaceVariant }]}
          onPress={() => openLink(TermsOfServiceURL)}
        >
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text
          variant="labelMedium"
          style={[styles.link, { color: colors.onSurfaceVariant }]}
          onPress={() => openLink(PrivacyPolicyURL)}
        >
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
