import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Allow optimization of local static files (public/seerah-media/*)
    localPatterns: [
      {
        pathname: "/seerah-media/**",
      },
    ],
    // Allow R2 public URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-5e47559fbd9145a4af1f58ceb3a42c81.r2.dev",
        pathname: "/**",
      },
    ],
    // Large slides/infographics — allow up to 100MB source files
    dangerouslyAllowSVG: false,
    // Serve modern formats
    formats: ["image/webp"],
    // Let ETag headers control revalidation rather than a fixed TTL
    minimumCacheTTL: 0,
    // Reasonable device sizes for slide viewing
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 512],
  },
};

export default nextConfig;
