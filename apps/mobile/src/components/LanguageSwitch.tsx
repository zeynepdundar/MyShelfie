import { Pressable, StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";
import { LOCALES, useI18n } from "@/i18n";
import { colors, fonts, radius } from "@/theme";

/** TR | EN anahtarı. */
export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {LOCALES.map((code) => {
        const selected = code === locale;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setLocale(code)}
            style={[styles.item, selected && styles.selected]}
          >
            <Txt style={[styles.label, selected && styles.labelSelected]}>{code.toUpperCase()}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.controlBorder,
  },
  item: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  selected: { backgroundColor: colors.yellow400 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.textMuted },
  labelSelected: { color: colors.textOnAccent },
});
