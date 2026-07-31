/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning during builds will not fail the build.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
