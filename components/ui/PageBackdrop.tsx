// A fixed, faint perforated-ball dot-grid texture behind the page - the
// pickleball's own hole pattern used as a background texture (per the
// brand brief), standing in for the old soft blurred gradient blobs (which
// also no longer have a palette to draw from - sage/blush were retired with
// the old design system). Public/customer only; admin's background is
// untouched, staying plain per "same brand, toned down".
export default function PageBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
      style={{
        backgroundImage: "radial-gradient(var(--text-primary) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}
