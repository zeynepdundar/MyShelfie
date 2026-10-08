import { forwardRef } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { Txt } from "@/components/Txt";
import { colors, fonts, radius } from "@/theme";

export const Field = forwardRef<TextInput, TextInputProps & { label?: string; hint?: string }>(
  function Field({ label, hint, style, multiline, ...props }, ref) {
    return (
      <View style={styles.wrap}>
        {label ? (
          <View style={styles.labelRow}>
            <Txt variant="label">{label}</Txt>
            {hint ? <Txt variant="caption">{hint}</Txt> : null}
          </View>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.yellow400}
          keyboardAppearance="dark"
          multiline={multiline}
          {...props}
          style={[styles.input, multiline && styles.multiline, style]}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  input: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.controlBorder,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  multiline: { minHeight: 120, textAlignVertical: "top" },
});
