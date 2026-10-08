import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookRow } from "@/components/BookRow";
import { Chips } from "@/components/Chips";
import { EmptyState, ErrorState, Loading } from "@/components/States";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { getBookStatus, type BookStatusKey } from "@/lib/bookStatus";
import { useBooks } from "@/providers/BooksProvider";
import { colors, fonts, radius, TAB_BAR_SPACE } from "@/theme";

type Filter = "all" | BookStatusKey;

/** Türkçe büyük/küçük harf ve aksanlardan bağımsız arama. */
const normalize = (value: string) =>
  value.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Library() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + TAB_BAR_SPACE;
  const { books, status, error, refreshing, reload } = useBooks();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return books.filter((book) => {
      if (filter !== "all" && getBookStatus(book) !== filter) return false;
      if (!q) return true;
      return normalize(`${book.title} ${book.author}`).includes(q);
    });
  }, [books, filter, query]);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("library.filters.all") },
    { value: "inProgress", label: t("library.filters.inProgress") },
    { value: "wantToRead", label: t("library.filters.wantToRead") },
    { value: "completed", label: t("library.filters.completed") },
  ];

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Txt variant="eyebrow">MYSHELFIE</Txt>
          <Txt variant="title">{t("library.title")}</Txt>
          {status === "ready" ? <Txt variant="caption">{t("library.count", { count: books.length })}</Txt> : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("library.addBook")}
          onPress={() => router.push("/add-book")}
          style={({ pressed }) => [styles.addButton, pressed && { backgroundColor: colors.yellow500 }]}
        >
          <Ionicons name="add" size={26} color={colors.textOnAccent} />
        </Pressable>
      </View>

      {books.length > 0 ? (
        <>
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("library.search")}
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
              keyboardAppearance="dark"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.chips}>
            <Chips options={filters} value={filter} onChange={setFilter} />
          </View>
        </>
      ) : null}
    </View>
  );

  if (status === "idle" || status === "loading") {
    return (
      <View style={styles.flex}>
        {header}
        <Loading />
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.flex}>
        {header}
        <View style={styles.pad}>
          <ErrorState error={error} onRetry={() => reload()} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={visible}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <BookRow book={item} />
        </View>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.pad}>
          {books.length === 0 ? (
            <EmptyState
              icon="book-outline"
              title={t("library.emptyTitle")}
              body={t("library.emptyBody")}
              action={{ label: t("library.addBook"), onPress: () => router.push("/add-book") }}
            />
          ) : (
            <Txt variant="caption" style={styles.centerText}>
              {t("library.emptyFiltered")}
            </Txt>
          )}
        </View>
      }
      contentContainerStyle={{ paddingBottom: bottomPadding, gap: 10 }}
      style={styles.flex}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => reload({ refreshing: true })} tintColor={colors.yellow400} />
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 14, paddingBottom: 6 },
  titleRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 20 },
  titleBlock: { gap: 4, flex: 1 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.yellow400,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.controlBorder,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.sans, fontSize: 15 },
  chips: {},
  cell: { paddingHorizontal: 20 },
  pad: { paddingHorizontal: 20, paddingTop: 12 },
  centerText: { textAlign: "center", paddingVertical: 24 },
});
