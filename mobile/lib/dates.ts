export interface DateOption {
  iso: string; // YYYY-MM-DD
  weekday: string; // "Mon"
  day: number; // 4
  month: string; // "Sep"
}

// Booking window: today through `days` days out (inclusive), matching the
// web BookingForm's min/max date range.
export function getBookingDateOptions(days: number): DateOption[] {
  const options: DateOption[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= days; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    options.push({
      iso: d.toISOString().split("T")[0],
      weekday: d.toLocaleDateString("en-LK", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-LK", { month: "short" }),
    });
  }

  return options;
}
