import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, which silently 413s any profile photo upload
      // between 1-2MB even though app/profile/actions.ts's own validation
      // advertises a 2MB cap (found via a real 413 in production logs
      // during E2E testing) - raise the platform limit to match what the
      // app actually promises the user. Module PDF/slide uploads allow up
      // to 10MB (lib/upload-validation.ts) - keep this comfortably above that.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
