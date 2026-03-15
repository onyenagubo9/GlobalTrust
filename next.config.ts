import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com", // if you still use LinkedIn image
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ✅ allow Unsplash
      },
    ],
  },
};

export default nextConfig;
