import type { GoogleBook } from "@shelfie/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/Button";
import { Chips } from "@/components/Chips";
import { Field } from "@/components/Field";
import { ModalHeader } from "@/components/ModalHeader";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { statusPatch, type BookStatusKey } from "@/lib/bookStatus";
import { hasGoogleBooksKey, searchGoogleBooks } from "@/lib/googleBooks";
import { useBooks } from "@/providers/BooksProvider";
import { colors, radius } from "@/theme";

interface Draft {
  title: string;
  author: string;
  pages: string;
  coverUrl?: string;
}

const EMPTY: Draft = { title: "", author: "", pages: "" };

export default function AddBook() {
  const { t } = useI18n();
  const { addBook } = useBooks();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [draft, setDraft] = useState<Draft | null>(hasGoogleBooksKey ? null : EMPTY);
  const [status, setStatus] = useState<BookStatusKey>("inProgress");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Yazmayı bırakınca ara (400 ms).
  useEffect(() => {
    const q = query.trim();
    if (!hasGoogleBooksKey || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const items = await searchGoogleBooks(q);
        if (!cancelled) setResults(items);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) {
          setSearching(false);
          setSearched(true);
        }
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const pick = (item: GoogleBook) =>
    setDraft({
      title: item.volumeInfo.title ?? "",
      author: item.volumeInfo.authors?.join(", ") ?? "",
      pages: item.volumeInfo.pageCount ? String(item.volumeInfo.pageCount) : "",
      coverUrl: item.volumeInfo.imageLinks?.thumbnail,
    });

  const save = async () => {
    if (!draft || !draft.title.trim() || !draft.author.trim()) {
      setError(t("addBook.required"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const flags = statusPatch(status, {});
      await addBook({
        title: draft.title.trim(),
        author: draft.author.trim(),
        pages: Number.parseInt(draft.pages, 10) || 0,
        coverUrl: draft.coverUrl,
        isCompleted: flags.isCompleted ?? false,
        wantToRead: flags.wantToRead ?? false,
        isFavorite: false,
        startDate: flags.startDate ?? undefined,
        endDate: flags.endDate ?? undefined,
      });
      router.back();
    } catch {
      setError(t("common.error"));
      setSaving(false);
    }
  };

  const statusOptions: { value: BookStatusKey; label: string }[] = [
    { value: "inProgress", label: t("status.inProgress") },
    { value: "wantToRead", label: t("status.wantToRead") },
    { value: "completed", label: t("status.completed") },
  ];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ModalHeader title={t("addBook.title")} />

        {draft ? (
          <View style={styles.form}>
            <View style={styles.preview}>
              <BookCover uri={draft.coverUrl} title={draft.title || "?"} width={72} />
              {hasGoogleBooksKey ? (
                <Button
                  title={t("common.cancel")}
                  variant="ghost"
                  compact
                  icon="arrow-back"
                  onPress={() => {
                    setDraft(null);
                    setError(null);
                  }}
                />
              ) : null}
            </View>
            <Field
              label={t("addBook.titleLabel")}
              value={draft.title}
              onChangeText={(title) => setDraft({ ...draft, title })}
            />
            <Field
              label={t("addBook.authorLabel")}
              value={draft.author}
              onChangeText={(author) => setDraft({ ...draft, author })}
            />
            <Field
              label={t("addBook.pagesLabel")}
              hint={t("common.optional")}
              value={draft.pages}
              keyboardType="number-pad"
              onChangeText={(pages) => setDraft({ ...draft, pages: pages.replace(/\D/g, "") })}
            />
            <View style={styles.statusBlock}>
              <Txt variant="label">{t("addBook.statusLabel")}</Txt>
              <View style={styles.statusRow}>
                <Chips scroll={false} options={statusOptions} value={status} onChange={setStatus} />
              </View>
            </View>

            {error ? <Txt style={styles.error}>{error}</Txt> : null}
            <Button title={t("addBook.add")} onPress={save} loading={saving} />
          </View>
        ) : (
          <View style={styles.form}>
            <Field
              value={query}
              onChangeText={setQuery}
              placeholder={t("addBook.searchPlaceholder")}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
            />

            {searching ? (
              <View style={styles.searching}>
                <ActivityIndicator color={colors.yellow400} />
                <Txt variant="caption">{t("addBook.searching")}</Txt>
              </View>
            ) : null}

            {!searching && searched && results.length === 0 ? (
              <Txt variant="caption">{t("addBook.noResults")}</Txt>
            ) : null}

            {results.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => pick(item)}
                style={({ pressed }) => [styles.result, pressed && { backgroundColor: colors.controlPressed }]}
              >
                <BookCover uri={item.volumeInfo.imageLinks?.thumbnail} title={item.volumeInfo.title} width={44} />
                <View style={styles.resultText}>
                  <Txt variant="label" numberOfLines={2}>
                    {item.volumeInfo.title}
                  </Txt>
                  <Txt variant="caption" numberOfLines={1}>
                    {item.volumeInfo.authors?.join(", ") ?? "—"}
                  </Txt>
                </View>
                <Ionicons name="add-circle" size={24} color={colors.yellow400} />
              </Pressable>
            ))}

            <Button
              title={t("addBook.manual")}
              variant="secondary"
              icon="create-outline"
              onPress={() => setDraft({ ...EMPTY, title: query.trim() })}
            />
          </View>
        )}

        {!hasGoogleBooksKey ? <Txt variant="caption">{t("addBook.noKey")}</Txt> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16 },
  form: { gap: 14 },
  preview: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  statusBlock: { gap: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  searching: { flexDirection: "row", alignItems: "center", gap: 10 },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.control,
  },
  resultText: { flex: 1, gap: 2 },
  error: { color: colors.danger },
});
