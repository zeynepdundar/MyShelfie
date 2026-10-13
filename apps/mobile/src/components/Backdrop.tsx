import { ImageBackground } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

/**
 * Her ekranın arkasındaki kitaplık fotoğrafı (web › --sf-page-image).
 * Web'deki yüksek çözünürlüklü resimden dikey kesit; bulanıklık yok, karartma
 * web'deki --sf-page-scrim ile aynı (%35).
 */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("@/assets/images/bookshelf-portrait.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrim: { backgroundColor: "rgba(0, 0, 0, 0.35)" },
});
