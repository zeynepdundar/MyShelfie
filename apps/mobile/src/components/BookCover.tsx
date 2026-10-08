import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { Txt } from "@/components/Txt";
import { colors, fonts } from "@/theme";

/** Kapak yoksa kitap adının baş harfleriyle yeşil bir sırt gösterilir. */
export function BookCover({
  uri,
  title,
  width = 64,
}: {
  uri?: string | null;
  title: string;
  width?: number;
}) {
  const height = Math.round(width * 1.5);
  const box = { width, height, borderRadius: Math.max(4, width * 0.06) };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.cover, box]}
        contentFit="cover"
        transition={200}
        recyclingKey={uri}
        accessibilityIgnoresInvertColors
      />
    );
  }

  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase())
    .join("");

  return (
    <View style={[styles.cover, styles.placeholder, box]}>
      <Txt style={[styles.initials, { fontSize: width * 0.32 }]}>{initials || "?"}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: colors.green800,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.edge,
  },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: colors.green600 },
  initials: { fontFamily: fonts.serif, color: colors.yellow200 },
});
