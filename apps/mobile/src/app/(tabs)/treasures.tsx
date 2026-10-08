import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCover } from "@/components/BookCover";
import { Glass } from "@/components/Glass";
import { QuoteCard } from "@/components/QuoteCard";
import { SectionTitle } from "@/components/SectionTitle";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { useBooks } from "@/providers/BooksProvider";
import { colors, TAB_BAR_SPACE } from "@/theme";

export default function Treasures() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { books, removeQuote } = useBooks();

  const favorites = useMemo(() => books.filter((b) => b.isFavorite), [books]);

  const quotes = useMemo(
    () =>
      books
        .flatMap((book) => (book.quotes ?? []).map((quote) => ({ quote, book })))
        .sort((a, b) => b.quote.dateAdded.localeCompare(a.quote.dateAdded)),
    [books]
  );

  const quotedBooks = useMemo(() => books.filter((b) => (b.quotes?.length ?? 0) > 0).length, [books]);

  const confirmRemove = (bookId: string, quoteId: string) =>
    Alert.alert(t("book.deleteQuoteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => void removeQuote(bookId, quoteId) },
    ]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_SPACE },
      ]}
    >
      <View style={styles.head}>
        <Txt variant="eyebrow">MYSHELFIE</Txt>
        <Txt variant="title">{t("treasures.title")}</Txt>
        <Txt variant="caption">{t("treasures.subtitle")}</Txt>
      </View>

      <Glass style={styles.stats}>
        <Stat value={favorites.length} label={t("treasures.stats.favorites")} />
        <View style={styles.divider} />
        <Stat value={quotes.length} label={t("treasures.stats.quotes")} />
        <View style={styles.divider} />
        <Stat value={quotedBooks} label={t("treasures.stats.quotedBooks")} />
      </Glass>

      <View style={styles.section}>
        <SectionTitle title={t("treasures.favorites")} />
        {favorites.length === 0 ? (
          <Txt variant="caption">{t("treasures.favoritesEmpty")}</Txt>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
            {favorites.map((book) => (
              <Pressable
                key={book.id}
                style={styles.shelfItem}
                onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}
              >
                <BookCover uri={book.coverUrl} title={book.title} width={96} />
                <Txt variant="label" numberOfLines={2}>
                  {book.title}
                </Txt>
                <Txt variant="caption" numberOfLines={1}>
                  {book.author}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle title={t("treasures.quotes")} meta={quotes.length ? String(quotes.length) : undefined} />
        {quotes.length === 0 ? (
          <Txt variant="caption">{t("treasures.quotesEmpty")}</Txt>
        ) : (
          quotes.map(({ quote, book }) => (
            <QuoteCard
              key={quote.id}
              text={quote.text}
              notes={quote.notes}
              meta={[book.title, quote.page ? t("treasures.page", { page: quote.page }) : null]
                .filter(Boolean)
                .join(" · ")}
              onLongPress={() => confirmRemove(book.id, quote.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="title" style={styles.statValue}>
        {value}
      </Txt>
      <Txt variant="caption" style={styles.statLabel}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 24 },
  head: { gap: 4 },
  stats: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { color: colors.mint },
  statLabel: { textAlign: "center" },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: "stretch", backgroundColor: colors.line },
  section: { gap: 12 },
  shelf: { gap: 14, paddingRight: 20 },
  shelfItem: { width: 96, gap: 6 },
});
