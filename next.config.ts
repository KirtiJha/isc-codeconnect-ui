import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "w3-ui-unified-profile-proxy.w3-ui.dal.app.cirrus.ibm.com",
      },
      {
        protocol: "https",
        hostname: "avatars.github.ibm.com",
      },
    ],
  },
};

export default nextConfig;
