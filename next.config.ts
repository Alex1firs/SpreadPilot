import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paystack.com',
      },
    ],
  },
};

export default nextConfig;
