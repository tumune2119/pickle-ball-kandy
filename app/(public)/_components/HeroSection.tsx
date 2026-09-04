import Link from "next/link";

interface HeroProps {
  title: string;
  subtitle: string;
  cta?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

export default function HeroSection({
  title,
  subtitle,
  cta,
  backgroundImage,
}: HeroProps) {
  return (
    <section
      className="relative py-20 md:py-32 px-4 text-center text-white"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`
          : "linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-gray-100">{subtitle}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
          >
            {cta.text}
          </Link>
        )}
      </div>
    </section>
  );
}
