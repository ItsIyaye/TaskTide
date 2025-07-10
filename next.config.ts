import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// next.config.js
// next.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public", // tells where to output service worker
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});



export default nextConfig;
