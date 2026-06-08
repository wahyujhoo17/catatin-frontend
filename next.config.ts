import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.240.0.91", "localhost"],
} as any; // Type override since types might not be updated

export default nextConfig;
