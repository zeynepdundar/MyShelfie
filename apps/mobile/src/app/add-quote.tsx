import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Chips } from "@/components/Chips";
import { Field } from "@/components/Field";
import { ModalHeader } from "@/components/ModalHeader";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { useBooks } from "@/providers/BooksProvider";
import { colors } from "@/theme";

export default function AddQuote() {
  const { bookId: initialBookId } = useLocalSearchParams<{ bookId?: string }>();
  const { t } = useI18n();
  const { books, getBook, addQuote } = useBooks();

  const [bookId, setBookId] = useState(initialBookId ?? books[0]?.id ?? "");
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const book = getBook(bookId);

  const save = async () => {
    if (!book || !text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addQuote(book.id, {
        text: text.trim(),
        page: Number.parseInt(page, 10) || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch {
      setError(t("addQuote.error"));
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ModalHeader title={t("addQuote.title")} subtitle={book ? `${book.title} · ${book.author}` : undefined} />

        {!initialBookId && books.length > 1 ? (
          <View style={styles.picker}>
            <Chips
              options={books.map((b) => ({ value: b.id, label: b.title }))}
              value={bookId}
              onChange={setBookId}
            />
          </View>
        ) : null}

        <Field
          label={t("addQuote.quoteLabel")}
          value={text}
          onChangeText={setText}
          placeholder={t("addQuote.quotePlaceholder")}
          multiline
          autoFocus
        />
        <Field
          label={t("addQuote.pageLabel")}
          hint={t("common.optional")}
          value={page}
          onChangeText={(value) => setPage(value.replace(/\D/g, ""))}
          placeholder={t("addQuote.pagePlaceholder")}
          keyboardType="number-pad"
        />
        <Field
          label={t("addQuote.notesLabel")}
          hint={t("common.optional")}
          value={notes}
          onChangeText={setNotes}
          placeholder={t("addQuote.notesPlaceholder")}
          multiline
          style={styles.notes}
        />

        {error ? <Txt style={styles.error}>{error}</Txt> : null}
        <Button title={t("addQuote.save")} onPress={save} loading={saving} disabled={!book || !text.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16 },
  picker: { marginHorizontal: -20 },
  notes: { minHeight: 80 },
  error: { color: colors.danger },
});
