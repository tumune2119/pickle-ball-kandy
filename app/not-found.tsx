import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="text-8xl font-mono text-action-lime mb-4">404</div>
        <h1 className="text-4xl font-display uppercase skew-display mb-4">Page Not Found</h1>
        <p className="text-xl mb-8 text-concrete-300">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-action-lime text-text-on-lime px-8 py-3 rounded-lg font-bold border-2 border-ink shadow-[3px_3px_0_var(--color-concrete-700)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-concrete-700)] transition"
          >
            Go Home
          </Link>
          <p className="text-concrete-300">
            <Link href="/contact" className="hover:text-white underline">
              Contact us
            </Link>
            {" "}if you need help
          </p>
        </div>
      </div>
    </div>
  );
}
