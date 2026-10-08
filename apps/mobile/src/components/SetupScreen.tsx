import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Glass } from "@/components/Glass";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";

/** EXPO_PUBLIC_API_URL tanımlı değilse uygulama yerine bu ekran görünür. */
export default function SetupScreen({ onReady }: { onReady: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Glass style={styles.card}>
          <Txt variant="eyebrow">MYSHELFIE</Txt>
          <Txt variant="title">{t("setup.title")}</Txt>
          <Txt variant="body">{t("setup.body")}</Txt>
        </Glass>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", padding: 20 },
  card: { gap: 12, padding: 24 },
});
