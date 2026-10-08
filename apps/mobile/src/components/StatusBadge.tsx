import { StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import type { BookStatusKey } from "@/lib/bookStatus";
import { fonts, radius, statusTone } from "@/theme";

export function StatusBadge({ status }: { status: BookStatusKey }) {
  const { t } = useI18n();
  const tone = statusTone[status];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Txt style={[styles.text, { color: tone.fg }]}>{t(`status.${status}`)}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  text: { fontFamily: fonts.sansSemiBold, fontSize: 12 },
});
