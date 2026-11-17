import { StyleSheet, View } from "react-native";
import { Dialog, Portal, useTheme } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";
import { Button } from "@components/ui/Button";
import { Text } from "@components/ui/Text";
import { openEmail } from "@utils/email";

const CONTACT_EMAIL = "hello@revelcy.com";

export default function MaintenanceNotice({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onClose}
        style={[styles.dialog, { backgroundColor: colors.background }]}
      >
        <Dialog.Content style={styles.content}>
          <SvgIcon name="smile-sad-outlined" color={colors.primary} size={72} />
          <View style={styles.copy}>
            <Text prominent variant="headlineSmall" style={[styles.text, { color: colors.onBackground }]}>
              Revelcy is paused
            </Text>
            <Text variant="bodyMedium" style={[styles.text, { color: colors.onSurfaceVariant }]}>
              Sign-in and token actions are currently unavailable. If you’d like to launch a token with us, email us.
            </Text>
          </View>
          <Button
            mode="contained"
            leftSvgIconName="mail"
            onPress={() => void openEmail({ to: CONTACT_EMAIL, subject: "Token launch request" })}
          >
            {CONTACT_EMAIL}
          </Button>
          <Button variant="secondary" mode="text" onPress={onClose}>
            Close
          </Button>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    alignSelf: "center",
    width: "92%",
    maxWidth: 440,
    marginHorizontal: 0,
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  copy: {
    gap: 8,
  },
  text: {
    textAlign: "center",
  },
});
