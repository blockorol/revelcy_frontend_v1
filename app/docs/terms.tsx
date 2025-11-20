import * as React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function RevelcyTermsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: colors.primary }]}
        >
          Revelcy – Terms and Conditions
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
          These Terms and Conditions ("Terms") govern your access to and use of
          the Revelcy website, smart-contract interactions, and platform
          enabling the creation and participation in meme-coin premarkets (the
          "Revelcy Platform" or "Platform"). By accessing or using the
          Platform, you agree to be bound by these Terms.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurface }]}
        >
          If you do not agree to these Terms, you must not use the Platform. We
          may update these Terms from time to time. When we make material
          changes, we will update the "Last Updated" date above. Your continued
          use of the Platform after changes are made constitutes acceptance of
          the updated Terms.
        </Text>

        {/* 1. About */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          1. About the Revelcy Platform
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Revelcy is a web3 platform that enables users to create and
          participate in premarkets for community-driven tokens, interact with
          smart contracts deployed on Solana, and optionally launch meme-coins
          through third-party services such as Pump.fun after premarket stages.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Revelcy does not provide investment products, financial advice, or
          guarantees of any kind. We are not a bank, broker, exchange,
          custodian, or financial intermediary.
        </Text>

        {/* 2. Eligibility */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          2. Eligibility
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          To use the Platform you must be at least 18 years old, not be
          prohibited from using web3 or digital asset services under applicable
          laws, and agree to comply with these Terms at all times. We may
          restrict access to the Platform for users from certain jurisdictions
          if required by law or risk considerations.
        </Text>

        {/* 3. Wallets */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          3. Wallets and Authentication
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Using the Platform generally requires connecting a compatible Solana
          wallet (such as Phantom). You are solely responsible for managing your
          private keys, seed phrases, and devices. Any transaction signed by
          your wallet is deemed authorised by you.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Revelcy may sign or co-sign certain backend-assisted transactions that
          are necessary for the functioning of the Platform, but we never have
          access to your private keys, and we do not control your wallet.
        </Text>

        {/* 4. Premarkets */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          4. Premarkets and Token Launches
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform enables you to create or join token premarkets. A
          premarket represents community interest and funding toward a potential
          token launch. You understand that participation in premarkets is
          speculative and highly risky. There is no guarantee that a token will
          be launched, will have liquidity, or will have any value.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Token launches carried out via Pump.fun or any other external
          platform are not controlled by Revelcy. We are not responsible for any
          outcomes of such launches or subsequent trading.
        </Text>

        {/* 5. User Content */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          5. User-Generated Content
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Users may submit text, images, links and other content associated with
          premarkets or tokens. You are solely responsible for the content you
          submit and for ensuring that it does not violate any laws or third
          party rights.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          You agree not to post content that is:
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • illegal, infringing, defamatory, hateful, or discriminatory
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • misleading, fraudulent, or deceptive
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • containing malware or harmful code
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.listItem, { color: colors.onSurfaceVariant }]}
        >
          • explicit or otherwise inappropriate for the Platform
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We may remove or restrict content at our sole discretion if we believe
          it violates these Terms or harms the Platform or its users.
        </Text>

        {/* 6. No Advice */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          6. No Financial, Legal, or Tax Advice
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          All information on the Platform is provided for informational and
          community purposes only. Nothing on the Platform constitutes financial,
          investment, legal, or tax advice. You are solely responsible for your
          decisions and should consult professional advisers where necessary.
        </Text>

        {/* 7. Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          7. Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Use of the Platform involves significant risks, including but not
          limited to volatility of digital assets, smart contract risks,
          third-party platform failures, regulatory changes, and complete loss
          of funds. By using the Platform, you acknowledge that you have read
          and understood our separate Risk Disclosure Statement and accept all
          such risks.
        </Text>

        {/* 8. Third-Party Services */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          8. Third-Party Services
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform integrates or interoperates with third-party services,
          including but not limited to Solana, RPC providers, hosting
          providers, and platforms such as Pump.fun. We do not control these
          services and are not responsible for their actions, policies, or
          failures.
        </Text>

        {/* 9. Fees */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          9. Fees
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform may charge certain fees, which will be disclosed where
          relevant. Blockchain network fees may also apply. All fees are
          generally non-refundable.
        </Text>

        {/* 10. No Warranty */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          10. No Warranty
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform is provided "as is" and "as available" without any
          warranty of any kind, whether express or implied. We do not guarantee
          continuous availability, security, or error-free operation.
        </Text>

        {/* 11. Limitation of Liability */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          11. Limitation of Liability
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          To the maximum extent permitted by law, Revelcy is not liable for any
          indirect, incidental, special, punitive, or consequential damages, or
          for any loss of profits, tokens, data, or goodwill arising out of or
          related to your use of the Platform.
        </Text>

        {/* 12. Termination */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          12. Termination
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          We may suspend or terminate your access to the Platform at any time,
          with or without notice, if we believe you have violated these Terms,
          engaged in fraudulent or harmful activity, or where we are required to
          do so by law. You may stop using the Platform at any time.
        </Text>

        {/* 13. Governing Law */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          13. Governing Law
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform is currently under active development and not yet
          associated with a formal legal entity. Once a legal entity and
          jurisdiction are defined, we will update these Terms accordingly.
        </Text>

        {/* 14. Contact */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          14. Contact
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          If you have questions about these Terms, please contact Revelcy
          Support.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingVertical: 24 },
  title: { marginBottom: 4 },
  updatedAt: { marginBottom: 16 },
  sectionTitle: {
    marginTop: 16,
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
