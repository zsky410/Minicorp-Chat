import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Disable SSR for client components to prevent hydration mismatch
  reactStrictMode: true,
};

export default nextConfig;

