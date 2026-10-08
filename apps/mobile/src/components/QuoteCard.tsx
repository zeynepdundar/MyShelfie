import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";
import { colors, fonts, radius } from "@/theme";

/** Çizgili defter yaprağı — yalnızca alıntılarda kullanılır. */
export function QuoteCard({
  text,
  meta,
  notes,
  onLongPress,
}: {
  text: string;
  meta?: string;
  notes?: string;
  onLongPress?: () => void;
}) {
  const [height, setHeight] = useState(0);
  const lineCount = Math.max(0, Math.floor((height - PAD) / LINE));

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={400}
      style={styles.paper}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    >
      {Array.from({ length: lineCount }, (_, i) => (
        <View key={i} style={[styles.rule, { top: PAD + LINE * (i + 1) - 4 }]} />
      ))}
      <View style={styles.margin} />
      <Txt variant="quote">“{text}”</Txt>
      {notes ? <Txt style={styles.notes}>{notes}</Txt> : null}
      {meta ? <Txt style={styles.meta}>{meta}</Txt> : null}
    </Pressable>
  );
}

/** Satır aralığı = alıntı metninin lineHeight'i; yazı çizgilerin üstüne oturur. */
const LINE = 26;
const PAD = 18;

const styles = StyleSheet.create({
  paper: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingVertical: PAD,
    paddingRight: 18,
    paddingLeft: 34,
    gap: 10,
    overflow: "hidden",
  },
  rule: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.paperLine },
  margin: {
    position: "absolute",
    left: 22,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: colors.paperMargin,
  },
  notes: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: "rgba(42, 38, 32, 0.75)" },
  meta: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.green600, letterSpacing: 0.3 },
});
