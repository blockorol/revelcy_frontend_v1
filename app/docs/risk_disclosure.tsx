import * as React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function RevelcyRiskDisclosureScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: colors.primary }]}
        >
          Revelcy – Risk Disclosure Statement
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
          This Risk Disclosure Statement ("Disclosure") is intended to inform
          you of the risks associated with using the Revelcy Platform
          ("Platform"). By accessing or using the Platform, you acknowledge and
          agree that you have read, understood, and accepted all risks described
          below. If you do not understand or do not agree with these risks, you
          must not use the Platform.
        </Text>

        {/* 1. General Web3 Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          1. General Web3 and Digital Asset Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Using blockchain technologies, cryptocurrencies, and meme tokens
          involves substantial risk. Prices can be extremely volatile and may
          move quickly in any direction. You may lose part or all of the assets
          you use on the Platform. Past performance of any digital asset or
          project is not indicative of future results.
        </Text>

        {/* 2. Smart Contract Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          2. Smart Contract Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform interacts with smart contracts deployed on Solana.
          Smart contracts may contain vulnerabilities, bugs, or unexpected
          behavior that could be exploited by malicious actors or lead to
          unintended consequences. Once a transaction is confirmed on the
          blockchain, it generally cannot be reversed.
        </Text>

        {/* 3. Premarket and Token Launch Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          3. Premarket and Token Launch Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform allows users to participate in premarkets for potential
          tokens. A premarket may fail, remain inactive, or never result in a
          token launch. Even if a token is launched, there is no guarantee that
          it will have any utility, liquidity, or value. Tokens may lose most or
          all of their value shortly after launch.
        </Text>

        {/* 4. Third-Party Services */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          4. Third-Party Platform and Service Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Revelcy interoperates with third-party services such as Solana RPC
          providers, hosting providers, and platforms like Pump.fun. Failures,
          downtimes, changes, or attacks affecting these services may result in
          delays, errors, or losses. Revelcy does not control these third-party
          systems.
        </Text>

        {/* 5. Wallet Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          5. Wallet and Private Key Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          You are responsible for securing your private keys, seed phrases, and
          devices. If your wallet is compromised, you may permanently lose your
          assets. Revelcy does not have access to your private keys and cannot
          recover stolen or lost funds. Any transaction signed by your wallet is
          treated as authorised by you.
        </Text>

        {/* 6. Blockchain Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          6. Blockchain Network Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Solana network may experience congestion, instability, halts, or
          other technical issues. Gas fees may increase significantly during
          periods of high activity. Network-level issues may delay or prevent
          the execution of your transactions and may lead to losses.
        </Text>

        {/* 7. Regulatory Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          7. Regulatory and Legal Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The legal status of cryptocurrencies, meme tokens, and decentralised
          finance varies by jurisdiction and can change over time. New laws,
          regulations, or interpretations may negatively impact your ability to
          use the Platform or your digital assets. You are solely responsible
          for understanding and complying with the laws that apply to you.
        </Text>

        {/* 8. Market Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          8. Market and Liquidity Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Meme-coin and token markets can be illiquid, speculative, and prone to
          manipulation. Prices may move rapidly and without clear reason. There
          may be limited or no opportunities to sell your tokens at a desired
          price or at all.
        </Text>

        {/* 9. Community and Information Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          9. Community and Information Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Information and content published by users on premarket pages or
          related channels may be inaccurate, misleading, promotional, or
          incomplete. Revelcy does not verify or endorse user-generated content.
          You must conduct your own research and due diligence before taking any
          action.
        </Text>

        {/* 10. Technical Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          10. Technical Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          The Platform may be affected by software bugs, infrastructure
          failures, data caching issues, browser incompatibilities, or
          deployment errors. Features may change or be removed at any time as
          the Platform evolves.
        </Text>

        {/* 11. No Advice */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          11. No Financial, Legal, or Tax Advice
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          Nothing on the Platform or in this Disclosure should be interpreted as
          financial, investment, legal, or tax advice. You should seek
          independent professional advice if you are unsure about any aspect of
          your participation in premarkets or use of digital assets.
        </Text>

        {/* 12. Acceptance of Risks */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.onSurface }]}
        >
          12. Acceptance of Risks
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.paragraph, { color: colors.onSurfaceVariant }]}
        >
          By using the Revelcy Platform, you confirm that you understand and
          accept all risks described in this Disclosure. You acknowledge that
          you may lose all assets involved in activities on or through the
          Platform and that you are solely responsible for your decisions.
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
    fontWeight: "600",
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 20,
  },
});
