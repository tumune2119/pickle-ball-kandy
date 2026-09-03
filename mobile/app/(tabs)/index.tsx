import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { Court, getCourts } from "@/lib/api";
import { COURT_LOCATION, COURT_NAME } from "@/lib/constants";
import { colors } from "@/lib/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCourts()
      .then((res) => setCourt(res.courts?.[0] ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load court info"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🏸</Text>
        <Text style={styles.title}>{court?.name ?? COURT_NAME}</Text>
        <Text style={styles.subtitle}>{court?.location ?? COURT_LOCATION}</Text>
      </View>

      {loading && <ActivityIndicator style={styles.spinner} color={colors.primary} />}

      {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Couldn&apos;t reach the server ({error}). Showing default court info.
          </Text>
          <Pressable onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {court && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Opening Hours</Text>
            <Text style={styles.rowValue}>
              {court.openingTime} – {court.closingTime}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Slot Duration</Text>
            <Text style={styles.rowValue}>{court.slotDuration} min</Text>
          </View>
          {!!court.googleMapsUrl && (
            <Pressable onPress={() => Linking.openURL(court.googleMapsUrl as string)}>
              <Text style={styles.mapLink}>📍 View on Google Maps</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.features}>
        <Feature emoji="📅" title="Easy Booking" body="Pick a date, pick a slot, done." />
        <Feature emoji="💰" title="Flexible Payment" body="Pay at venue or online via PayHere." />
        <Feature emoji="⏰" title="Free Cancellation" body="Cancel free ahead of your booking." />
      </View>

      <Pressable style={styles.cta} onPress={() => router.push("/(tabs)/book")}>
        <Text style={styles.ctaText}>Book a Court →</Text>
      </Pressable>
    </ScrollView>
  );
}

function Feature({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: "center", paddingVertical: 24 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  spinner: { marginTop: 12 },
  errorBanner: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.warning, marginBottom: 6 },
  retryText: { color: colors.primary, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.text, fontWeight: "700" },
  mapLink: { color: colors.primary, fontWeight: "700", marginTop: 8 },
  features: { gap: 12, marginBottom: 24 },
  feature: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
  },
  featureEmoji: { fontSize: 22, marginBottom: 4 },
  featureTitle: { fontWeight: "700", color: colors.text, marginBottom: 2 },
  featureBody: { color: colors.muted, fontSize: 13 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
