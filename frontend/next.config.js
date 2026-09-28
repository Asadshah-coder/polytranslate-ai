/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small and self-contained.
  output: 'standalone',
};

module.exports = nextConfig;
