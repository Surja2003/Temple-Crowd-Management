import type { NextConfig } from "next";
// PWA support using next-pwa
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ...other config options
  experimental: {
    // Required for service worker in app directory
    swcPlugins: [],
  },
  // If using next-pwa, config would go here
  // pwa: {
  //   dest: "public",
  //   disable: !isProd,
  // },
};

export default nextConfig;
