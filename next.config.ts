import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.240.0.91", "localhost"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
