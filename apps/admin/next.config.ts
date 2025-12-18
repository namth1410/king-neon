import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9002",
        pathname: "/king-neon/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9002",
        pathname: "/king-neon/**",
      },
      // Production MinIO/S3
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
