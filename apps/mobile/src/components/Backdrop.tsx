import { ImageBackground } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

/** Her ekranın arkasındaki kitaplık fotoğrafı (web › --sf-page-image). */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("@/assets/images/bookshelf.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={2}
      />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrim: { backgroundColor: "rgba(6, 5, 4, 0.55)" },
});
