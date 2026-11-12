/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'bestinvest-buzau.vercel.app', 'www.camimob.ro', 'camimob.ro'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  async redirects() {
    return [
      {
        // /apartamente-unirii-buzau was split into Unirii Nord and Unirii Sud.
        // It is an indexed URL, so it must not 404. Sud is the target because
        // the old page filtered on zone ~ "unirii", and every listing that
        // ever matched it was in Unirii Sud — that is the content visitors
        // arriving from search actually saw.
        source: '/apartamente-unirii-buzau',
        destination: '/apartamente-unirii-sud-buzau',
        permanent: true,
      },
      {
        // /imobiliare-dorobanti-2-buzau was split by property type into
        // apartamente- and case-dorobanti-2-buzau. It was live only briefly,
        // but redirect rather than 404 in case it was already crawled.
        // Apartments get the redirect because that is the higher-volume
        // query shape for a city quarter.
        source: '/imobiliare-dorobanti-2-buzau',
        destination: '/apartamente-dorobanti-2-buzau',
        permanent: true,
      },

      // The services subtree was renamed from English to Romanian to match
      // the rest of the site. The five child URLs were indexed, so each one
      // redirects permanently to its new path. Note /api/services is the
      // lead-capture API route and is deliberately NOT renamed.
      { source: '/services', destination: '/servicii', permanent: true },
      {
        source: '/services/evaluation',
        destination: '/servicii/evaluare-proprietate',
        permanent: true,
      },
      {
        source: '/services/consulting',
        destination: '/servicii/consultanta-imobiliara',
        permanent: true,
      },
      {
        source: '/services/legal',
        destination: '/servicii/consiliere-juridica',
        permanent: true,
      },
      {
        source: '/services/exclusivity',
        destination: '/servicii/exclusivitate',
        permanent: true,
      },
      {
        source: '/services/commissions',
        destination: '/servicii/comisioane',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig