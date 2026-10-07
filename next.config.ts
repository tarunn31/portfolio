import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/resume", destination: "/resume.pdf", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/resume.pdf",
        destination: "/Sai_Tarun_Reddy_Lankireddy_Resume.pdf",
      },
    ];
  },
};

export default nextConfig;
