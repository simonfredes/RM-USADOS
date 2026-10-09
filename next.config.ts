import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Isolate browser-test builds from a developer's running server.
  distDir: process.env.RM_BUILD_DIR || ".next",
  devIndicators: false,
  images: {
    remotePatterns: supabaseUrl
      ? [new URL("/storage/v1/object/public/vehicle-images/**", supabaseUrl)]
      : [],
  },
};

export default nextConfig;
