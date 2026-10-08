import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Glass } from "@/components/Glass";
import { Txt } from "@/components/Txt";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useI18n } from "@/i18n";
import { authErrorKey, useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme";

export default function Welcome() {
  const { t } = useI18n();
  const { signInGuest } = useAuth();
  const [busy, setBusy] = useState(false);

  const startAsGuest = async () => {
    setBusy(true);
    try {
      await signInGuest();
    } catch (error) {
      Alert.alert(t(authErrorKey(error)));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <LanguageSwitch />
      </View>

      <View style={styles.hero}>
        <Txt variant="eyebrow">MYSHELFIE · {t("welcome.tagline")}</Txt>
        <Txt variant="display" style={styles.title}>
          {t("welcome.title")}
        </Txt>
        <Txt variant="body" style={styles.subtitle}>
          {t("welcome.subtitle")}
        </Txt>
      </View>

      <Glass style={styles.actions}>
        <Button title={t("welcome.startGuest")} onPress={startAsGuest} loading={busy} />
        <Txt variant="caption" style={styles.hint}>
          {t("welcome.guestHint")}
        </Txt>
        <Button
          title={t("welcome.withEmail")}
          variant="secondary"
          icon="mail-outline"
          onPress={() => router.push("/sign-in")}
          disabled={busy}
        />
      </Glass>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  top: { alignItems: "flex-end", paddingTop: 8 },
  hero: { flex: 1, justifyContent: "flex-end", gap: 14, paddingBottom: 28 },
  title: { fontSize: 40, lineHeight: 46 },
  subtitle: { color: colors.textMuted, maxWidth: 320 },
  actions: { gap: 12, padding: 20 },
  hint: { textAlign: "center", marginTop: -4, marginBottom: 4 },
});
