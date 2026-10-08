import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: buildSecurityHeaders(process.env.NODE_ENV === "production") },
      {
        // Answers are per question and never cached or indexed.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/resume", destination: "/resume.pdf", permanent: false }];
  },
  async rewrites() {
    return [{ source: "/resume.pdf", destination: "/Sai_Tarun_Reddy_Lankireddy_Resume.pdf" }];
  },
};

export default nextConfig;
