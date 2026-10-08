import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Glass } from "@/components/Glass";
import { Txt } from "@/components/Txt";
import { useI18n } from "@/i18n";
import { ApiError } from "@/lib/api";
import { colors } from "@/theme";

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.yellow400} size="large" />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <Glass style={styles.empty}>
      <Ionicons name={icon} size={32} color={colors.yellow400} />
      <Txt variant="heading" style={styles.centerText}>
        {title}
      </Txt>
      {body ? (
        <Txt variant="caption" style={styles.centerText}>
          {body}
        </Txt>
      ) : null}
      {action ? <Button title={action.label} onPress={action.onPress} icon="add" style={styles.action} /> : null}
    </Glass>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useI18n();
  const isNetwork = error instanceof ApiError && error.status === 0;
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title={isNetwork ? t("common.networkError") : t("common.error")}
      action={{ label: t("common.retry"), onPress: onRetry }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: 10, paddingVertical: 32 },
  centerText: { textAlign: "center" },
  action: { marginTop: 8, alignSelf: "stretch" },
});
