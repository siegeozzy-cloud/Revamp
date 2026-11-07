import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root so a package-lock.json further up the filesystem
  // is not mistaken for this project's.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
