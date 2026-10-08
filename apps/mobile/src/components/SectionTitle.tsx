import { StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";

/** Hazinem ve kitap detayındaki bölüm başlıkları — hepsi aynı stilde. */
export function SectionTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={styles.row}>
      <Txt variant="heading">{title}</Txt>
      {meta ? <Txt variant="caption">{meta}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
});
