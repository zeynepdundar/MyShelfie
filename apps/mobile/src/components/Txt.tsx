import { StyleSheet, Text, type TextProps } from "react-native";

import { colors, fonts } from "@/theme";

type Variant = "display" | "title" | "heading" | "body" | "label" | "caption" | "eyebrow" | "quote";

const variants = StyleSheet.create({
  display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, color: colors.text, letterSpacing: -0.5 },
  title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.text, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 25, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.text },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 19, color: colors.text },
  caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 2, color: colors.yellow400 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 26, color: colors.paperInk },
});

export function Txt({ variant = "body", style, ...props }: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[variants[variant], style]} />;
}
