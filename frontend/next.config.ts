import type { NextConfig } from "next";

const backendOrigin = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: `${backendOrigin}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/uploads/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/uploads/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
