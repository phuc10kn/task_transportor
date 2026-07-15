import type { NextConfig } from "next";

const apiOrigin = process.env.CIS_API_ORIGIN?.replace(/\/$/, "");

if (!apiOrigin) {
  throw new Error("CIS_API_ORIGIN is required to build or run the admin web.");
}

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
