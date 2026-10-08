import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput } from "react-native";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { ModalHeader } from "@/components/ModalHeader";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { authErrorKey, useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme";

type Mode = "signIn" | "signUp" | "link";

/** E-posta ile giriş, kayıt ve misafir hesabı kalıcı hâle getirme. */
export function EmailAuthForm({ initialMode }: { initialMode: Mode }) {
  const { t } = useI18n();
  const { signInEmail, signUpEmail, linkEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const title =
    mode === "signIn" ? t("auth.signInTitle") : mode === "signUp" ? t("auth.signUpTitle") : t("auth.linkTitle");
  const submitLabel = mode === "signIn" ? t("auth.signIn") : mode === "signUp" ? t("auth.signUp") : t("auth.link");

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "signIn") await signInEmail(email, password);
      else if (mode === "signUp") await signUpEmail(email, password);
      else {
        await linkEmail(email, password);
        router.back();
      }
      // Giriş/kayıtta korumalı rotalar kendiliğinden sekmelere geçer.
    } catch (err) {
      setError(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError(t("auth.errors.invalidEmail"));
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(t("auth.resetSent", { email: email.trim() }));
    } catch (err) {
      setError(t(authErrorKey(err)));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ModalHeader title={title} subtitle={mode === "link" ? t("auth.linkSubtitle") : undefined} />

        <Field
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          textContentType={mode === "signIn" ? "password" : "newPassword"}
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {error ? <Txt style={styles.error}>{error}</Txt> : null}

        <Button title={submitLabel} onPress={submit} loading={busy} disabled={!email || !password} />

        {mode === "signIn" ? (
          <Button title={t("auth.forgot")} variant="ghost" onPress={forgot} compact />
        ) : null}

        {mode !== "link" ? (
          <Button
            title={mode === "signIn" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
            variant="ghost"
            compact
            onPress={() => {
              setError(null);
              setMode(mode === "signIn" ? "signUp" : "signIn");
            }}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16 },
  error: { color: colors.danger },
});
