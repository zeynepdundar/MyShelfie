import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/Button";
import { Chips } from "@/components/Chips";
import { Glass } from "@/components/Glass";
import { QuoteCard } from "@/components/QuoteCard";
import { SectionTitle } from "@/components/SectionTitle";
import { EmptyState } from "@/components/States";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import type { BookPatch } from "@/lib/books";
import { getBookStatus, statusPatch, type BookStatusKey } from "@/lib/bookStatus";
import { formatDate } from "@/lib/format";
import { useBooks } from "@/providers/BooksProvider";
import { colors } from "@/theme";

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { getBook, updateBook, removeBook, removeQuote } = useBooks();
  const [saving, setSaving] = useState(false);

  const book = getBook(id);

  if (!book) {
    return (
      <View style={[styles.content, { paddingTop: insets.top + 64 }]}>
        <EmptyState icon="help-circle-outline" title={t("book.notFound")} />
      </View>
    );
  }

  const status = getBookStatus(book);
  const quotes = book.quotes ?? [];

  const patch = async (changes: BookPatch) => {
    setSaving(true);
    try {
      await updateBook(book.id, changes);
    } catch {
      Alert.alert(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t("book.deleteConfirmTitle"), t("book.deleteConfirmBody", { title: book.title }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await removeBook(book.id);
            router.back();
          } catch {
            Alert.alert(t("common.error"));
          }
        },
      },
    ]);

  const confirmRemoveQuote = (quoteId: string) =>
    Alert.alert(t("book.deleteQuoteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => void removeQuote(book.id, quoteId) },
    ]);

  const statusOptions: { value: BookStatusKey; label: string }[] = [
    { value: "inProgress", label: t("status.inProgress") },
    { value: "wantToRead", label: t("status.wantToRead") },
    { value: "completed", label: t("status.completed") },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={book.isFavorite ? t("book.removeFavorite") : t("book.addFavorite")}
                onPress={() => patch({ isFavorite: !book.isFavorite })}
              >
                <Ionicons
                  name={book.isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={book.isFavorite ? colors.yellow400 : colors.text}
                />
              </Pressable>
              <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel={t("book.deleteBook")} onPress={confirmDelete}>
                <Ionicons name="trash-outline" size={22} color={colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.hero}>
          <BookCover uri={book.coverUrl} title={book.title} width={120} />
          <View style={styles.heroText}>
            <Txt variant="title">{book.title}</Txt>
            <Txt variant="body" style={styles.author}>
              {t("book.by", { author: book.author })}
            </Txt>
          </View>
        </View>

        <Glass style={styles.card}>
          <Txt variant="label" style={styles.muted}>
            {t("book.status")}
          </Txt>
          <View style={styles.statusRow}>
            <Chips
              scroll={false}
              options={statusOptions}
              value={status}
              onChange={(next) => next !== status && patch(statusPatch(next, book))}
            />
          </View>

          <View style={styles.facts}>
            <Fact label={t("book.started")} value={formatDate(book.startDate, locale)} />
            <Fact label={t("book.finished")} value={formatDate(book.endDate ?? book.dateRead, locale)} />
            <Fact label={t("book.pages")} value={book.pages ? String(book.pages) : "—"} />
          </View>

          <View style={styles.ratingRow}>
            <Txt variant="label" style={styles.muted}>
              {t("book.rating")}
            </Txt>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  hitSlop={6}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel={`${n}/5`}
                  onPress={() => patch({ rating: book.rating === n ? null : n })}
                >
                  <Ionicons
                    name={(book.rating ?? 0) >= n ? "star" : "star-outline"}
                    size={24}
                    color={(book.rating ?? 0) >= n ? colors.yellow400 : colors.textFaint}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </Glass>

        {book.notes ? (
          <Glass style={styles.card}>
            <Txt variant="label" style={styles.muted}>
              {t("book.notes")}
            </Txt>
            <Txt variant="body">{book.notes}</Txt>
          </Glass>
        ) : null}

        <View style={styles.section}>
          <SectionTitle title={t("book.quotes")} meta={quotes.length ? String(quotes.length) : undefined} />
          {quotes.length === 0 ? <Txt variant="caption">{t("book.noQuotes")}</Txt> : null}
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              text={quote.text}
              notes={quote.notes}
              meta={quote.page ? t("treasures.page", { page: quote.page }) : undefined}
              onLongPress={() => confirmRemoveQuote(quote.id)}
            />
          ))}
          <Button
            title={t("book.addQuote")}
            variant="secondary"
            icon="add"
            onPress={() => router.push({ pathname: "/add-quote", params: { bookId: book.id } })}
          />
        </View>
      </ScrollView>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Txt variant="caption">{label}</Txt>
      <Txt variant="label">{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 18 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 4 },
  hero: { flexDirection: "row", gap: 18, alignItems: "flex-end" },
  heroText: { flex: 1, gap: 6 },
  author: { color: colors.textMuted },
  card: { gap: 14 },
  muted: { color: colors.textMuted },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  facts: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 14,
  },
  fact: { flex: 1, gap: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stars: { flexDirection: "row", gap: 6 },
  section: { gap: 12 },
});
