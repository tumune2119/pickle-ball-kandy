import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { Booking, cancelBooking, getBookings } from "@/lib/api";
import { CANCELLATION_POLICY_HOURS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { colors } from "@/lib/theme";

type Filter = "upcoming" | "past";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "✓ Confirmed",
  pending_payment: "⏳ Pending Payment",
  paid: "✓ Paid",
  cancelled: "✗ Cancelled",
};

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: colors.successBg, border: colors.successBorder, text: colors.success },
  paid: { bg: colors.successBg, border: colors.successBorder, text: colors.success },
  pending_payment: { bg: colors.warningBg, border: colors.warningBorder, text: colors.warning },
  cancelled: { bg: colors.dangerBg, border: colors.dangerBorder, text: colors.danger },
};

const PAYMENT_LABEL: Record<string, string> = {
  paid: "✓ Paid",
  unpaid: "⏳ Unpaid",
  refunded: "↩ Refunded",
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("upcoming");

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const res = await getBookings(userId);
      setBookings(res.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleCancel = (booking: Booking) => {
    Alert.alert("Cancel booking", `Cancel your ${booking.bookingDate} ${booking.startTime} booking?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelBooking(booking.id);
            load();
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "Failed to cancel booking");
          }
        },
      },
    ]);
  };

  const now = Date.now();
  const filtered = bookings.filter((b) => {
    const dt = new Date(`${b.bookingDate}T${b.startTime}`).getTime();
    return filter === "upcoming" ? dt >= now : dt < now;
  });
  const upcomingCount = bookings.filter(
    (b) => new Date(`${b.bookingDate}T${b.startTime}`).getTime() >= now
  ).length;
  const pastCount = bookings.length - upcomingCount;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        <Pressable style={styles.tab} onPress={() => setFilter("upcoming")}>
          <Text style={[styles.tabText, filter === "upcoming" && styles.tabTextActive]}>
            📅 Upcoming ({upcomingCount})
          </Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => setFilter("past")}>
          <Text style={[styles.tabText, filter === "past" && styles.tabTextActive]}>
            ✓ Past ({pastCount})
          </Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {filter === "upcoming" ? "No upcoming bookings" : "No past bookings"}
              </Text>
              {filter === "upcoming" && (
                <Pressable style={styles.emptyCta} onPress={() => router.push("/(tabs)/book")}>
                  <Text style={styles.emptyCtaText}>Book Now →</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.confirmed;
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardLabel}>📅 Date &amp; Time</Text>
                  <Text style={styles.cardDate}>{formatDate(item.bookingDate)}</Text>
                  <Text style={styles.cardTime}>
                    {item.startTime} – {item.endTime}
                  </Text>
                </View>
                <View style={styles.cardAmountBox}>
                  <Text style={styles.cardLabel}>Amount</Text>
                  <Text style={styles.cardAmount}>{formatCurrency(item.amountLkr)}</Text>
                </View>
              </View>

              <Text style={styles.cardPlayers}>
                👥 {item.numPlayers} player{item.numPlayers > 1 ? "s" : ""}
              </Text>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {PAYMENT_LABEL[item.paymentStatus] ?? item.paymentStatus}
                  </Text>
                </View>
              </View>

              {filter === "upcoming" && item.status !== "cancelled" && (
                <>
                  <Text style={styles.cancelHint}>
                    Free cancellation up to {CANCELLATION_POLICY_HOURS}h before your slot.
                  </Text>
                  <Pressable style={styles.cancelButton} onPress={() => handleCancel(item)}>
                    <Text style={styles.cancelButtonText}>✕ Cancel Booking</Text>
                  </Pressable>
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { color: colors.muted, fontWeight: "600" },
  tabTextActive: { color: colors.primary },
  errorBox: {
    margin: 16,
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  errorText: { color: colors.danger },
  retryText: { color: colors.primary, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { color: colors.muted, marginBottom: 12 },
  emptyCta: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  emptyCtaText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  cardLabel: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  cardDate: { fontWeight: "700", color: colors.text, fontSize: 15 },
  cardTime: { color: colors.primary, fontWeight: "600" },
  cardAmountBox: { alignItems: "flex-end" },
  cardAmount: { fontWeight: "800", color: colors.primary, fontSize: 16 },
  cardPlayers: { color: colors.text, marginBottom: 10 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  cancelHint: { fontSize: 11, color: colors.muted, marginBottom: 8 },
  cancelButton: {
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.danger, fontWeight: "700" },
});
