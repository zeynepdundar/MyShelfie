import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Backdrop } from "@/components/Backdrop";
import { I18nProvider } from "@/i18n";
import { isApiConfigured } from "@/lib/api";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { BooksProvider } from "@/providers/BooksProvider";
import SetupScreen from "@/components/SetupScreen";
import { colors, fonts } from "@/theme";

void SplashScreen.preventAutoHideAsync();

/** Arka plandaki kitaplık fotoğrafı görünsün diye gezinme zemini saydam. */
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "transparent",
    card: colors.glassModal,
    primary: colors.yellow400,
    text: colors.text,
    border: colors.line,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Font yüklenemezse sistem fontuyla devam et; uygulama açılış ekranında kalmasın.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="light" />
            <Backdrop>
              {isApiConfigured ? (
                <AuthProvider>
                  <BooksProvider>
                    <RootNavigator />
                  </BooksProvider>
                </AuthProvider>
              ) : (
                <SetupScreen onReady={() => SplashScreen.hide()} />
              )}
            </Backdrop>
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Modallar kendi koyu zeminini taşır; arkadaki ekran karışmasın. */
const modal = {
  presentation: "modal",
  contentStyle: { backgroundColor: colors.glassModal },
} as const;

function RootNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) SplashScreen.hide();
  }, [initializing]);

  if (initializing) return null;

  const signedIn = Boolean(user);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        headerTransparent: true,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.serif },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" options={modal} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/[id]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="add-book" options={modal} />
        <Stack.Screen name="add-quote" options={modal} />
        <Stack.Screen name="link-account" options={modal} />
      </Stack.Protected>
    </Stack>
  );
}
