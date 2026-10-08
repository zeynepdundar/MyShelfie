import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useState, type ComponentProps } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Glass } from "@/components/Glass";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { isBookFinished } from "@/lib/bookStatus";
import { authErrorKey, useAuth } from "@/providers/AuthProvider";
import { useBooks } from "@/providers/BooksProvider";
import { colors, fonts, TAB_BAR_SPACE } from "@/theme";

const SITE_URL = "https://myshelfie.space";

export default function Account() {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const { books } = useBooks();
  const [deleting, setDeleting] = useState(false);

  const isGuest = user?.isAnonymous ?? false;
  const name = user?.displayName || user?.email || t("account.guest");

  const counts = useMemo(
    () => ({
      books: books.length,
      completed: books.filter(isBookFinished).length,
      quotes: books.reduce((sum, b) => sum + (b.quotes?.length ?? 0), 0),
    }),
    [books]
  );

  const confirmSignOut = () => {
    if (!isGuest) {
      void signOut();
      return;
    }
    Alert.alert(t("account.signOutGuestTitle"), t("account.signOutGuestBody"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("account.signOut"), style: "destructive", onPress: () => void signOut() },
    ]);
  };

  const confirmDelete = () =>
    Alert.alert(t("account.deleteTitle"), t("account.deleteBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("account.deleteAccount"),
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteAccount();
            // Oturum kapanınca korumalı rotalar karşılama ekranına döner.
          } catch (error) {
            Alert.alert(t(authErrorKey(error)));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);

  const openSite = (path: string) => void WebBrowser.openBrowserAsync(`${SITE_URL}/${locale}${path}`);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_SPACE },
      ]}
    >
      <View style={styles.head}>
        <Txt variant="eyebrow">MYSHELFIE</Txt>
        <Txt variant="title">{t("account.title")}</Txt>
      </View>

      <Glass style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name={isGuest ? "person-outline" : "person"} size={26} color={colors.yellow200} />
        </View>
        <View style={styles.profileText}>
          <Txt variant="heading" numberOfLines={1}>
            {name}
          </Txt>
          {user?.email && user.displayName ? <Txt variant="caption">{user.email}</Txt> : null}
        </View>
      </Glass>

      {isGuest ? (
        <Glass style={styles.notice}>
          <Txt variant="body">{t("account.guestNotice")}</Txt>
          <Button title={t("account.saveAccount")} icon="shield-checkmark-outline" onPress={() => router.push("/link-account")} />
        </Glass>
      ) : null}

      <Glass style={styles.stats}>
        <Stat value={counts.books} label={t("account.stats.books")} />
        <Stat value={counts.completed} label={t("account.stats.completed")} />
        <Stat value={counts.quotes} label={t("account.stats.quotes")} />
      </Glass>

      <Glass padded={false}>
        <Row icon="language-outline" label={t("account.language")} trailing={<LanguageSwitch />} />
        <Row icon="lock-closed-outline" label={t("account.privacy")} onPress={() => openSite("/privacy")} />
        <Row icon="document-text-outline" label={t("account.terms")} onPress={() => openSite("/terms")} last />
      </Glass>

      <Button title={t("account.signOut")} variant="secondary" icon="log-out-outline" onPress={confirmSignOut} />
      <Button title={t("account.deleteAccount")} variant="danger" onPress={confirmDelete} loading={deleting} />

      <Txt variant="caption" style={styles.version}>
        {t("account.version", { version: Constants.expoConfig?.version ?? "—" })}
      </Txt>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="title" style={{ color: colors.mint }}>
        {value}
      </Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  trailing,
  last = false,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowLine, pressed && { backgroundColor: colors.control }]}
    >
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Txt style={styles.rowLabel}>{label}</Txt>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 16 },
  head: { gap: 4, marginBottom: 4 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green600,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: { flex: 1, gap: 2 },
  notice: { gap: 14, borderColor: "rgba(255, 199, 3, 0.35)" },
  stats: { flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 54 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { flex: 1, fontFamily: fonts.sansMedium },
  version: { textAlign: "center", marginTop: 8 },
});
