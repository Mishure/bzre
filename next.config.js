/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'bestinvest-buzau.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'www.camimob.ro',
      },
      {
        protocol: 'https',
        hostname: 'camimob.ro',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
}

module.exports = nextConfig