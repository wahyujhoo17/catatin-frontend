import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.1.1.190", "localhost"],
} as any; // Type override since types might not be updated

export default nextConfig;
