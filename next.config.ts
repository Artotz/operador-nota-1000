import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  async redirects() {
    return ["/about", "/metrics", "/solucoes", "/desempenho", "/sobre", "/contato"].map(
      (source) => ({ source, destination: "/", permanent: false }),
    );
  },
};

export default nextConfig;
