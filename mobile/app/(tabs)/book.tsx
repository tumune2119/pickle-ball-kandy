import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  Court,
  createBooking,
  getAvailability,
  getCourts,
  initiatePayment,
  PaymentMode,
} from "@/lib/api";
import { BOOKING_WINDOW_DAYS, MAX_PLAYERS } from "@/lib/constants";
import { getBookingDateOptions } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { calcTotalLkr, endTimeForSlots, isOffPeak } from "@/lib/pricing";
import { colors } from "@/lib/theme";

const dateOptions = getBookingDateOptions(BOOKING_WINDOW_DAYS);

export default function BookScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const [court, setCourt] = useState<Court | null>(null);
  const [courtError, setCourtError] = useState<string | null>(null);
  const [loadingCourt, setLoadingCourt] = useState(true);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].iso);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [totalSlots, setTotalSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const [numPlayers, setNumPlayers] = useState(2);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("pay_at_venue");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  useEffect(() => {
    getCourts()
      .then((res) => setCourt(res.courts?.[0] ?? null))
      .catch((err) => setCourtError(err instanceof Error ? err.message : "Failed to load court"))
      .finally(() => setLoadingCourt(false));
  }, []);

  const loadAvailability = useCallback(() => {
    if (!court) return;
    setLoadingSlots(true);
    setSlotsError(null);
    setRangeStart(null);
    setSelectedSlots([]);
    getAvailability(selectedDate, court.id)
      .then((res) => {
        setAvailableSlots(res.availableSlots);
        setTotalSlots(res.totalSlots);
      })
      .catch((err) => setSlotsError(err instanceof Error ? err.message : "Failed to load availability"))
      .finally(() => setLoadingSlots(false));
  }, [court, selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const total = useMemo(() => calcTotalLkr(selectedSlots), [selectedSlots]);

  const handleSlotPress = (slot: string) => {
    if (!availableSlots.includes(slot)) return;

    // Second tap: already have a start, and this slot is currently selected
    // -> tapping any selected slot clears the selection.
    if (selectedSlots.includes(slot) && rangeStart === null) {
      setSelectedSlots([]);
      return;
    }

    if (!rangeStart) {
      setRangeStart(slot);
      setSelectedSlots([slot]);
      return;
    }

    const startIdx = totalSlots.indexOf(rangeStart);
    const endIdx = totalSlots.indexOf(slot);
    if (startIdx === -1 || endIdx === -1) {
      setRangeStart(slot);
      setSelectedSlots([slot]);
      return;
    }

    const [lo, hi] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const range = totalSlots.slice(lo, hi + 1);
    const allAvailable = range.every((s) => availableSlots.includes(s));

    if (!allAvailable) {
      Alert.alert(
        "Unavailable slot in range",
        "That range includes an already-booked slot. Starting a new selection instead."
      );
      setRangeStart(slot);
      setSelectedSlots([slot]);
      return;
    }

    setSelectedSlots(range);
    setRangeStart(null);
  };

  const handleSubmit = async () => {
    if (!userId || !court) return;
    if (selectedSlots.length === 0) {
      Alert.alert("Select a time slot", "Please choose at least one time slot.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const startTime = selectedSlots[0];
      const endTime = endTimeForSlots(selectedSlots);

      const { booking } = await createBooking({
        userId,
        courtId: court.id,
        bookingDate: selectedDate,
        startTime,
        endTime,
        numPlayers,
        amountLkr: total,
        paymentMode,
      });

      if (paymentMode === "payhere") {
        const payment = await initiatePayment(booking.id);
        router.push({
          pathname: "/payhere-checkout",
          params: { checkoutUrl: payment.checkoutUrl, fields: JSON.stringify(payment.fields) },
        });
        return;
      }

      setConfirmedBookingId(booking.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => {
    setConfirmedBookingId(null);
    loadAvailability();
  };

  if (confirmedBookingId) {
    return (
      <View style={styles.confirmScreen}>
        <Text style={styles.confirmEmoji}>✓</Text>
        <Text style={styles.confirmTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmBody}>
          Reference: BK#{confirmedBookingId.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={styles.confirmBody}>
          {selectedDate} · {selectedSlots[0]}–{endTimeForSlots(selectedSlots)}
        </Text>
        <Text style={styles.confirmAmount}>{formatCurrency(total)}</Text>
        <Pressable style={styles.cta} onPress={() => router.push("/(tabs)/my-bookings")}>
          <Text style={styles.ctaText}>View My Bookings</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={startOver}>
          <Text style={styles.secondaryButtonText}>Book Another Slot</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Book Your Court</Text>

      {loadingCourt && <ActivityIndicator color={colors.primary} />}
      {courtError && <Text style={styles.errorText}>{courtError}</Text>}
      {!loadingCourt && !court && !courtError && (
        <Text style={styles.errorText}>No court is configured yet. Please contact the venue.</Text>
      )}

      {court && (
        <>
          <Text style={styles.sectionLabel}>1. Select a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
            {dateOptions.map((opt) => {
              const selected = opt.iso === selectedDate;
              return (
                <Pressable
                  key={opt.iso}
                  onPress={() => setSelectedDate(opt.iso)}
                  style={[styles.dateChip, selected && styles.dateChipSelected]}
                >
                  <Text style={[styles.dateChipWeekday, selected && styles.dateChipTextSelected]}>
                    {opt.weekday}
                  </Text>
                  <Text style={[styles.dateChipDay, selected && styles.dateChipTextSelected]}>
                    {opt.day}
                  </Text>
                  <Text style={[styles.dateChipWeekday, selected && styles.dateChipTextSelected]}>
                    {opt.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>2. Select time slot(s)</Text>
          <Text style={styles.helperText}>
            Tap a start slot, then tap an end slot to select a consecutive range. 🟢 off-peak (before
            5 PM) · 🟠 peak (5 PM+)
          </Text>

          {loadingSlots && <ActivityIndicator color={colors.primary} />}
          {slotsError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{slotsError}</Text>
              <Pressable onPress={loadAvailability}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {!loadingSlots && !slotsError && (
            <View style={styles.slotGrid}>
              {totalSlots.map((slot) => {
                const booked = !availableSlots.includes(slot);
                const selected = selectedSlots.includes(slot);
                return (
                  <Pressable
                    key={slot}
                    disabled={booked}
                    onPress={() => handleSlotPress(slot)}
                    style={[
                      styles.slot,
                      booked && styles.slotBooked,
                      !booked && !selected && (isOffPeak(slot) ? styles.slotOffPeak : styles.slotPeak),
                      selected && styles.slotSelected,
                    ]}
                  >
                    <Text style={[styles.slotText, selected && styles.slotTextSelected]}>{slot}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {selectedSlots.length > 0 && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                {selectedSlots.length} hour(s): {selectedSlots[0]} – {endTimeForSlots(selectedSlots)}
              </Text>
              <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>3. Number of players</Text>
          <View style={styles.playerRow}>
            {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => setNumPlayers(n)}
                style={[styles.playerChip, numPlayers === n && styles.playerChipSelected]}
              >
                <Text style={[styles.playerChipText, numPlayers === n && styles.dateChipTextSelected]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>4. Payment method</Text>
          <PaymentOption
            selected={paymentMode === "pay_at_venue"}
            title="Pay at Venue"
            body="Pay when you arrive. Booking confirmed immediately."
            onPress={() => setPaymentMode("pay_at_venue")}
          />
          <PaymentOption
            selected={paymentMode === "payhere"}
            title="Online Payment (PayHere)"
            body="Pay securely by card. Opens PayHere checkout."
            onPress={() => setPaymentMode("payhere")}
          />

          {submitError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          )}

          <Pressable
            style={[
              styles.cta,
              (submitting || selectedSlots.length === 0) && styles.ctaDisabled,
            ]}
            disabled={submitting || selectedSlots.length === 0}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                Confirm Booking · {formatCurrency(total)}
              </Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function PaymentOption({
  selected,
  title,
  body,
  onPress,
}: {
  selected: boolean;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.paymentOption, selected && styles.paymentOptionSelected]} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.paymentOptionText}>
        <Text style={styles.paymentOptionTitle}>{title}</Text>
        <Text style={styles.paymentOptionBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 16 },
  sectionLabel: { fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 8 },
  helperText: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  errorText: { color: colors.danger },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  retryText: { color: colors.primary, fontWeight: "700" },
  dateRow: { flexGrow: 0 },
  dateChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: colors.card,
  },
  dateChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateChipWeekday: { fontSize: 11, color: colors.muted },
  dateChipDay: { fontSize: 18, fontWeight: "800", color: colors.text },
  dateChipTextSelected: { color: "#fff" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotOffPeak: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  slotPeak: { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
  slotBooked: { backgroundColor: colors.border, borderColor: colors.border, opacity: 0.6 },
  slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  slotTextSelected: { color: "#fff" },
  summaryBox: {
    marginTop: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: { color: colors.text, fontWeight: "600", flex: 1, marginRight: 8 },
  summaryTotal: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  playerRow: { flexDirection: "row", gap: 10 },
  playerChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  playerChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  playerChipText: { fontWeight: "700", color: colors.text },
  paymentOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  paymentOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  paymentOptionText: { flex: 1 },
  paymentOptionTitle: { fontWeight: "700", color: colors.text },
  paymentOptionBody: { color: colors.muted, fontSize: 12, marginTop: 2 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: colors.disabled },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryButton: { alignItems: "center", marginTop: 14 },
  secondaryButtonText: { color: colors.primary, fontWeight: "700" },
  confirmScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  confirmEmoji: { fontSize: 56, color: colors.success, marginBottom: 12 },
  confirmTitle: { fontSize: 24, fontWeight: "800", color: colors.success, marginBottom: 8 },
  confirmBody: { color: colors.text, marginBottom: 4 },
  confirmAmount: { fontSize: 22, fontWeight: "800", color: colors.primary, marginVertical: 12 },
});
