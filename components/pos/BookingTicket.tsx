import { COURT_NAME } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export interface TicketBooking {
  id: string;
  courtName: string;
  bookingDate: string; // yyyy-mm-dd
  startTime: string; // HH:MM or HH:MM:SS
  endTime: string;
  customerName: string;
  customerPhone?: string | null;
  numPlayers: number;
  amountLkr: number;
  paymentStatus: string;
}

function formatDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-LK", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

// The printable booking ticket. Styled with the same window.print() +
// Tailwind print: convention already used on the weekly schedule page (no
// print library) - print:text-black etc. so it reads correctly on paper
// regardless of light/dark mode on screen. Used both inline right after a
// till checkout and at the standalone reprint route.
export default function BookingTicket({ booking, footerText }: { booking: TicketBooking; footerText?: string }) {
  return (
    <div className="max-w-sm mx-auto bg-white text-black print:max-w-none border-2 border-ink print:border-0 rounded-lg print:rounded-none p-6 print:p-0 font-mono">
      <div className="text-center mb-4">
        <div className="font-bold text-lg uppercase">{COURT_NAME}</div>
        <div className="text-xs text-concrete-600">Booking Ticket</div>
      </div>
      <div className="border-t border-dashed border-concrete-400 my-3" />
      <dl className="space-y-1.5 text-sm">
        <Row label="Ref" value={booking.id.slice(0, 8).toUpperCase()} />
        <Row label="Court" value={booking.courtName} />
        <Row label="Date" value={formatDate(booking.bookingDate)} />
        <Row label="Time" value={`${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`} />
        <Row label="Players" value={String(booking.numPlayers)} />
        <Row label="Customer" value={booking.customerName} />
        {booking.customerPhone && <Row label="Phone" value={booking.customerPhone} />}
      </dl>
      <div className="border-t border-dashed border-concrete-400 my-3" />
      <dl className="space-y-1.5 text-sm">
        <Row label="Amount" value={formatCurrency(booking.amountLkr)} bold />
        <Row label="Payment" value={booking.paymentStatus.toUpperCase()} />
      </dl>
      <div className="border-t border-dashed border-concrete-400 my-3" />
      <p className="text-center text-xs text-concrete-600">{footerText || "Thank you — see you on the court!"}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-concrete-600">{label}</dt>
      <dd className={bold ? "font-bold" : ""}>{value}</dd>
    </div>
  );
}
