import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius } from "@/theme";

/**
 * Koyu cam kart: arkadaki kitaplık bulanık görünür, üstünde nötr siyah ton.
 * Android'de gerçek bulanıklık pahalı ve tutarsız; orada daha koyu, düz
 * yarı saydam yüzey kullanılıyor.
 */
export function Glass({
  children,
  style,
  strong = false,
  padded = true,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  padded?: boolean;
}) {
  const tint = strong ? colors.glassStrong : colors.glass;

  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: Platform.OS === "ios" ? tint : colors.glassStrong },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.edge,
    overflow: "hidden",
  },
  padded: { padding: 16 },
});
