import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// next.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'public/sw.js', // use a TypeScript service worker
});


module.exports = withPWA({
  reactStrictMode: true,
});


export default nextConfig;
