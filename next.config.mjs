/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Avoid CI-only ESLint/plugin drift failing Vercel when `next lint` is clean locally.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
