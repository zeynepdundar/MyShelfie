import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export function ModalHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useI18n();
  return (
    <View style={styles.wrap}>
      <View style={styles.grabber} />
      <View style={styles.row}>
        <Txt variant="title" style={styles.title}>
          {title}
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.close}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
      </View>
      {subtitle ? <Txt variant="caption">{subtitle}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, paddingTop: 10, paddingBottom: 8 },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { flex: 1 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.control },
});
