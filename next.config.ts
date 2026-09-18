import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.139", "192.168.1.134", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
      },
    ],
  },
};

export default withPWA(nextConfig);