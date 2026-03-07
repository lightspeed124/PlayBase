import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "kidzzstarjumpers.com",
      },
      {
        protocol: "https",
        hostname: "rental.software",
      },
    ],
  },
};

export default nextConfig;
