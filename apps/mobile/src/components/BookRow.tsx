import type { Book } from "@shelfie/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BookCover } from "@/components/BookCover";
import { Glass } from "@/components/Glass";
import { StatusBadge } from "@/components/StatusBadge";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { getBookStatus } from "@/lib/bookStatus";
import { colors } from "@/theme";

export const BookRow = memo(function BookRow({ book }: { book: Book }) {
  const { t } = useI18n();
  const quoteCount = book.quotes?.length ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Glass style={styles.card} padded={false}>
        <BookCover uri={book.coverUrl} title={book.title} width={58} />
        <View style={styles.body}>
          <Txt variant="heading" numberOfLines={2}>
            {book.title}
          </Txt>
          <Txt variant="caption" numberOfLines={1}>
            {book.author}
          </Txt>
          <View style={styles.meta}>
            <StatusBadge status={getBookStatus(book)} />
            {book.pages ? <Txt variant="caption">{t("common.pagesShort", { count: book.pages })}</Txt> : null}
            {quoteCount > 0 ? (
              <View style={styles.inline}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textMuted} />
                <Txt variant="caption">{quoteCount}</Txt>
              </View>
            ) : null}
          </View>
        </View>
        {book.isFavorite ? (
          <Ionicons name="heart" size={18} color={colors.yellow400} style={styles.heart} />
        ) : null}
      </Glass>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  card: { flexDirection: "row", gap: 14, padding: 12, alignItems: "center" },
  body: { flex: 1, gap: 4 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 4 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  heart: { alignSelf: "flex-start" },
});
