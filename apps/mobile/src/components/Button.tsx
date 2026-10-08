import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Txt } from "@/components/Txt";
import { colors, fonts, radius } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const palette = PALETTE[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: pressed ? palette.pressed : palette.bg, borderColor: palette.border },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={palette.fg} /> : null}
          <Txt style={[styles.label, compact && styles.labelCompact, { color: palette.fg }]}>{title}</Txt>
        </View>
      )}
    </Pressable>
  );
}

const PALETTE: Record<Variant, { bg: string; pressed: string; fg: string; border: string }> = {
  primary: { bg: colors.yellow400, pressed: colors.yellow500, fg: colors.textOnAccent, border: "transparent" },
  secondary: { bg: colors.control, pressed: colors.controlPressed, fg: colors.text, border: colors.controlBorder },
  ghost: { bg: "transparent", pressed: colors.control, fg: colors.text, border: "transparent" },
  danger: { bg: "rgba(255, 143, 143, 0.12)", pressed: "rgba(255, 143, 143, 0.22)", fg: colors.danger, border: "rgba(255, 143, 143, 0.3)" },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: { minHeight: 38, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 15 },
  labelCompact: { fontSize: 14 },
  inactive: { opacity: 0.5 },
});
