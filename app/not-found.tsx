import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="text-8xl font-bold mb-4">404</div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl mb-8 text-blue-100">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Go Home
          </Link>
          <p className="text-blue-100">
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
