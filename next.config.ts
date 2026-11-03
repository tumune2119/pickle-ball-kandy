import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal ./.next/standalone folder with only the files needed
  // to run `node server.js` - what the Dockerfile copies into the runtime image.
  output: "standalone",
  // Baseline protective headers - this app handles a payment flow and admin
  // auth, so clickjacking/MIME-sniffing protection is cheap insurance. No
  // CSP here: this app embeds a Google Maps iframe and talks to Supabase/
  // PayHere, and a wrong CSP fails closed (breaks real functionality)
  // rather than open - add one deliberately, tuned and tested against
  // those exact origins, rather than guessing one here.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
