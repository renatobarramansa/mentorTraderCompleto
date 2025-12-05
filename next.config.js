/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  // Corrige problemas de caminho no Windows
  outputFileTracingRoot: process.cwd(),
}

module.exports = nextConfig