// Soft, fixed blurred color blobs behind a page's content - the "something
// colorful behind the glass" that frosted-glass cards (see Card's `glass`
// prop) need to actually read as glass rather than plain translucent boxes.
// Public/customer only; admin's page background is untouched.
export default function PageBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] bg-sage-300/30 dark:bg-sage-700/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute top-[20%] right-[-15%] w-[28rem] h-[28rem] bg-blush-300/25 dark:bg-blush-800/15 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] w-[30rem] h-[30rem] bg-sage-200/30 dark:bg-sage-900/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2.4s" }}
      />
    </div>
  );
}
