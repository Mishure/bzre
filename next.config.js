/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'bestinvest-buzau.vercel.app', 'www.camimob.ro', 'camimob.ro'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
}

module.exports = nextConfig