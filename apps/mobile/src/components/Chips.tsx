import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Txt } from "@/components/Txt";
import { colors, fonts, radius } from "@/theme";

/** Yatay kaydırılan seçim çipleri (filtreler, durum seçimi). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  scroll = true,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  scroll?: boolean;
}) {
  const items = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange(option.value)}
        style={({ pressed }) => [
          styles.chip,
          selected ? styles.selected : pressed && styles.pressed,
        ]}
      >
        <Txt style={[styles.label, selected && styles.labelSelected]}>{option.label}</Txt>
      </Pressable>
    );
  });

  if (!scroll) return <>{items}</>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.controlBorder,
  },
  pressed: { backgroundColor: colors.controlPressed },
  selected: { backgroundColor: colors.yellow400, borderColor: colors.yellow400 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.text },
  labelSelected: { color: colors.textOnAccent },
});
