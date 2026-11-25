import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import { AccountTabIcon, LibraryTabIcon, TreasuresTabIcon } from "@/components/TabIcons";
import { useI18n } from "@/i18n";
import { colors, fonts } from "@/theme";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        tabBarActiveTintColor: colors.yellow400,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        tabBarStyle: {
          position: "absolute",
          borderTopColor: colors.line,
          backgroundColor: Platform.OS === "ios" ? "transparent" : colors.glassModal,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <View style={StyleSheet.absoluteFill}>
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
            </View>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.library"),
          tabBarIcon: ({ focused }) => <LibraryTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="treasures"
        options={{
          title: t("tabs.treasures"),
          tabBarIcon: ({ focused }) => <TreasuresTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.account"),
          tabBarIcon: ({ focused }) => <AccountTabIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
