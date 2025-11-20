import * as React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function RevelcyPrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: colors.primary }]}
        >
          Revelcy – Privacy Notice
        </Text>
        <Text
          variant="labelSmall"
          style={[styles.updatedAt, { color: colors.onSurfaceVariant }]}
        >
          Last Updated: 20 November 2025
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurface }]}
        >
          This Privacy Notice describes the privacy practices of Revelcy
          ("Revelcy", "we", "our", or "us") in connection with our website and
          platform that enable the creation and participation in meme-coin
          premarkets (the "Revelcy Platform" or "Platform"). It also explains
          the rights and choices available to individuals with respect to their
          information.
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurface }]}
        >
          By accessing or using the Platform, you acknowledge that you have read
          and understood this Privacy Notice. If you do not agree with this
          Privacy Notice, you must not use the Platform.
        </Text>

        {/* 1. Updates */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Changes to this Privacy Notice
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We may update this Privacy Notice from time to time to reflect changes
          in laws, regulations, industry standards, or the Revelcy Platform. If
          we make material changes, we will update the "Last Updated" date
          above. If you disagree with the changes, you should discontinue your
          use of the Platform.
        </Text>

        {/* 2. Age */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Age Restrictions
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Our Platform is intended only for individuals who are at least 18
          years old. We do not knowingly collect personal data from anyone under
          18. If you believe that a minor has provided us with personal data,
          please contact us and we will delete it as soon as reasonably
          possible.
        </Text>

        {/* 3. Controller & Definition */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Personal Data Controller
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          "Personal Data" means information that can be associated with an
          identified or identifiable person. It does not include aggregated or
          anonymised information that can no longer be used to identify an
          individual. Revelcy acts as the controller of the Personal Data we
          process in connection with the Platform.
        </Text>

        {/* 4. Data We Collect */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Personal Data We Collect
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subTitle, { color: colors.onSurface }]}
        >
          User account information
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Wallet address
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Internal userId
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Username
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Avatar URL stored on our platform
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.subTitle, { color: colors.onSurface }]}
        >
          Premarket-related information
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We store information about which premarkets you created or joined and
          how much you contributed. We also store community information linked
          to a premarket (text, images, links) which you or other users submit
          to our backend. While this is primarily project-related information,
          it may be associated with your account.
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.subTitle, { color: colors.onSurface }]}
        >
          Data that may be added later
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform is under active development. In the future, we may
          collect additional data such as IP addresses, device information and
          analytics data. If we expand the categories of Personal Data we
          collect, we will update this Privacy Notice.
        </Text>

        {/* 5. Cookies */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Cookies, Local Storage and Similar Technologies
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We use cookies, local storage, and similar technologies to support
          login sessions, store tokens or preferences, and improve the user
          experience. We do not use cookies for targeted advertising. You can
          adjust your browser or device settings to manage cookies, but
          disabling them may affect the functionality of the Platform.
        </Text>

        {/* 6. How We Use Data */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          How We Use Personal Data
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To provide access to and operate the Revelcy Platform
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To authenticate your wallet and account
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To track your participation in premarkets
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To store and display community content related to premarkets
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To improve the Platform and prevent fraud or abuse
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • To comply with legal obligations where applicable
        </Text>

        {/* 7. Legal Basis */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Legal Basis for Processing
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Where applicable law (such as GDPR) requires a legal basis for
          processing, we rely on the following:
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Performance of a contract or service – to operate the Platform and
          provide requested features.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Legitimate interests – including security, fraud prevention and
          improving the Platform.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • Consent – where we explicitly request it for optional features.
        </Text>

        {/* 8. Sharing */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          How We Share Personal Data
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We may share Personal Data with third-party service providers that
          help us run the Platform (for example, hosting, storage, caching,
          blockchain RPC providers). These providers act on our instructions and
          are not permitted to use your Personal Data for their own purposes.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          When you interact with the Solana blockchain, transaction data may be
          recorded on a public, decentralised ledger that is outside our
          control. We cannot modify or delete data that is stored on-chain.
        </Text>

        {/* 9. Retention */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Data Retention
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We retain Personal Data for as long as necessary to fulfil the
          purposes described in this Privacy Notice or as required by law. Once
          data is no longer needed, we will delete it or, where appropriate,
          de-identify it. Blockchain data recorded on Solana cannot be erased by
          us.
        </Text>

        {/* 10. Your Rights */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Your Rights
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Depending on your jurisdiction, you may have rights such as access,
          rectification, deletion (off-chain data only), restriction of
          processing, objection to processing, data portability, and withdrawal
          of consent. To exercise these rights, please contact Revelcy Support
          with enough information to verify your identity and describe your
          request.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          These rights do not apply to data stored on public blockchains, which
          cannot be altered or removed by us.
        </Text>

        {/* 11. Security */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Data Security
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We use reasonable technical and organisational measures to protect
          Personal Data. However, no system or transmission over the internet is
          completely secure. You are responsible for keeping your wallet,
          private keys, and devices secure.
        </Text>

        {/* 12. Contact */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          Contact
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          If you have questions about this Privacy Notice or how we process your
          Personal Data, please contact Revelcy Support.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    marginBottom: 4,
  },
  updatedAt: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 4,
  },
  subTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 20,
  },
  listItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
