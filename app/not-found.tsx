import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sage-600 to-sage-800 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="text-8xl font-bold mb-4">404</div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl mb-8 text-sage-100">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-white dark:bg-gray-900 text-sage-600 dark:text-sage-400 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            Go Home
          </Link>
          <p className="text-sage-100">
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
